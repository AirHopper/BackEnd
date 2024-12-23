import PDFDocument from 'pdfkit';
import imagekit from './imageKit.js';
import { format } from 'date-fns';
import dotenv from 'dotenv';
dotenv.config();

// Sepearte the ticket into flights and passengers
const getFlightsAndPassengers = (order, ticket) => {
    if (!ticket) return [];

    return ticket.flights.map(flight => {
        const passengers = order.passengers.map(passenger => ({
            ...passenger,
            seat: passenger.seat.find(seat => seat.flightId === flight.id)
        })).filter(passenger => passenger.seat);

        return {
            flight,
            passengers
        };
    });
};

// Add QR Code image and logo to the PDF
const drawImage = async (doc, x, y, width, imageQrUrl) => {
    const response = await fetch(imageQrUrl);
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    doc.image(imageBuffer, x, y, { width });
}

const drawFlightTable = (doc, items, startX, startY) => {
    const columnWidths = [325, 100, 75];
    const rowHeight = 20; 

    let y = startY;
    const headers = ["Name", "Class", "Seat Number"];

    doc.font("Helvetica-Bold");
    doc.lineWidth(1);

    headers.forEach((header, i) => {
        const colX = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(colX, y, columnWidths[i], rowHeight).fillAndStroke("#D3D3D3", "#000");
        doc.fillColor("#000").text(header, colX + 5, y + 5, {
            width: columnWidths[i] - 10,
            align: "center",
        });
    });

    doc.moveTo(startX, y + rowHeight)
       .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y + rowHeight)
       .stroke();

    y += rowHeight;

    items.forEach((item) => {
	if (item.class.includes("_")) item.class = item.class.replace("_", " ");
        const row = [item.name, item.class, item.seatNumber];
        row.forEach((text, i) => {
            const colX = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.fillColor("#000").font("Helvetica").text(text, colX + 5, y + 5, {
                width: columnWidths[i] - 10,
                align: "center",
            });
            doc.moveTo(colX, y)
               .lineTo(colX, y + rowHeight)
               .stroke();
        });

        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
        y += rowHeight;
    });

    return y;
};

const drawPaymentTable = (doc, items, startX, startY) => {
    const columnWidths = [250, 100, 150]; 
    const rowHeight = 20;

    let y = startY;
    const headers = ["Name", "Type", "Price"];

    doc.font("Helvetica-Bold");
    doc.lineWidth(1);

    headers.forEach((header, i) => {
        const colX = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(colX, y, columnWidths[i], rowHeight).fillAndStroke("#D3D3D3", "#000");
        doc.fillColor("#000").text(header, colX + 5, y + 5, {
            width: columnWidths[i] - 10,
            align: "center",
        });
    });

    doc.moveTo(startX, y + rowHeight)
       .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y + rowHeight)
       .stroke();

    y += rowHeight;

    let total = 0;
    items.forEach((item) => {
        const row = [item.name, item.type, `Rp ${item.price.toLocaleString()}`];
        row.forEach((text, i) => {
            const colX = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            doc.fillColor("#000").font("Helvetica").text(text, colX + 5, y + 5, {
                width: columnWidths[i] - 10,
                align: "center",
            });
            doc.moveTo(colX, y)
               .lineTo(colX, y + rowHeight)
               .stroke();
        });
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
        total += item.price;
        y += rowHeight;
    });

    doc.font("Helvetica-Bold").text("Total", startX + columnWidths[0], y + 5, {
        width: columnWidths[1],
        align: "center",
    });
    doc.font("Helvetica").text(`Rp ${total.toLocaleString()}`, startX + columnWidths[0] + columnWidths[1] + 5, y + 5, {
        width: columnWidths[2] - 10,
        align: "center",
    });

    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
    return y; 
};

const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm');
};

const flightTable = (doc, x, y, flight, passengers, seatClass) => {
    const distanceY = 15;
    doc.font("Helvetica").fontSize(10).text(`Airline: ${flight.airline.name}`, x, y);
    doc.font("Helvetica").fontSize(10).text(`Departure Airport: ${flight.departure.airport.name}`, x, y+=distanceY);
    doc.font("Helvetica").fontSize(10).text(`Departure Time: ${formatDate(flight.departure.time)}`, x, y+=distanceY);
    doc.font("Helvetica").fontSize(10).text(`Arrival Airport: ${flight.arrival.airport.name}`, x, y+=distanceY);
    doc.font("Helvetica").fontSize(10).text(`Arrival Time: ${formatDate(flight.arrival.time)}`, x, y+=distanceY);

	const formattedPassengers = passengers.map((passenger) => ({
		name: `${passenger.title}. ${passenger.name}`,
		class: seatClass,
		seatNumber: passenger.seat.number
	}));
        
    const finalY = drawFlightTable(doc, formattedPassengers, x, y+=distanceY) + distanceY;
    return finalY;
};

const paymentTable = (doc, order, x, y) => {
    const distanceY = 15;
	const paymentMethod = (order.payment.method).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    doc.font("Helvetica").fontSize(10).text(`Payment Method: ${paymentMethod}`, x, y);
	const adultDetail = order.detailPrice.find(detail => detail.type === 'adult');
	const childDetail = order.detailPrice.find(detail => detail.type === 'children');
	const adultPrice = adultDetail ? Math.ceil(adultDetail.totalPrice / adultDetail.amount) : 0;
	const childPrice = childDetail ? Math.ceil(childDetail.totalPrice / adultDetail.amount) : 0;

	const formattedPassengers = order.passengers.map((passenger) => {
		let price;
		let type;
		if (passenger.type === 'Dewasa') {
			price = adultPrice;
			type = 'Adult';
		}
		if (passenger.type === 'Anak') {
			price = childPrice;
			type = 'Child';
		}

		return {
			name: `${passenger.title}. ${passenger.name}`,
			type,
			price
		}
	});

    const finalY = drawPaymentTable(doc, formattedPassengers, x, y+distanceY) + distanceY;
    return finalY;
};

const outboundTicket = (doc, order, x, y) => {
	doc.font("Helvetica-Bold").fontSize(20).text("Departure Order Details", x, y);
	y += 30;

	const seatClassOutbound = order.outboundTicket.class;
	const outboundFlightsAndPassengers = getFlightsAndPassengers(order, order.outboundTicket);
	
	outboundFlightsAndPassengers.forEach(({ flight, passengers }) => {
		y = flightTable(doc, x, y, flight, passengers, seatClassOutbound);
		y += 15
	});
}

const returnTicket = (doc, order) => {
	doc.addPage();
	let x = 50;
	let y = 50;
	doc.font("Helvetica-Bold").fontSize(20).text("Return Order Details", x, y);
	y += 30;

	const seatClassReturn = order.returnTicket.class;
	const returnFlightsAndPassengers = getFlightsAndPassengers(order, order.returnTicket);

	returnFlightsAndPassengers.forEach(({ flight, passengers }) => {
		y = flightTable(doc, x, y, flight, passengers, seatClassReturn);
		y += 15
	});
}

const header = async (doc, order, x, y, qrCodeUrl, imageLogoUrl) => {
	await drawImage(doc, x, y, 68, imageLogoUrl); // imageLogoUrl
	await drawImage(doc, 485, y-3, 74, qrCodeUrl); // imageQrUrl

	doc.font("Helvetica-Bold").fontSize(20).text("AirHopper", x+205, y+25);
	y+=100;
	doc.font("Helvetica").fontSize(15).text(`Order Id: ${order.id}`, x, y);
	y+=20;
	doc.font("Helvetica").fontSize(10).text(`Order Date: ${formatDate(order.bookingDate)}`, x, y);
	y += 30;

	return y;
}

const payment = (doc, order) => {
	doc.addPage();
	let x = 50;
	let y = 50;
	doc.font("Helvetica-Bold").fontSize(20).text("Payment Details", x, y);
	y += 30;
	y = paymentTable(doc, order, x, y);
}

export const createPdfUrlByOrderId = async (order, qrCodeUrl) => {
    try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        // Initialize
	    let x = 50;
	    let y = 50;
	    y = await header(doc, order, x, y, qrCodeUrl, process.env.IMAGE_LOGO_URL);
	    outboundTicket(doc, order, x, y);
	    if (order.returnTicket) returnTicket(doc, order); // Next page (if return ticket not null)
	    payment(doc, order); // Next page
        doc.end();

        // End
        return new Promise((resolve, reject) => {
            doc.on('end', async () => {
                try {
                    const pdfData = Buffer.concat(buffers);
                    const uploadedPdf = await imagekit.upload({
                        file: pdfData,
                        fileName: `order_${order.id}.pdf`,
                        folder: "/order_pdfs",
                        useUniqueFileName: false,
                    });
                    resolve(uploadedPdf.url);
                } catch (uploadError) {
                    reject(uploadError);
                }
            });

            doc.on('error', (err) => {
                reject(err);
            });
        });

    } catch (error) {
        console.error(error);
    }
}
