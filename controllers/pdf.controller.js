const fs = require('fs')
const puppeteer = require('puppeteer')
const { PDFDocument } = require('pdf-lib')
const path = require('path')
const { catchAsync } = require('../utils/error.util')

const createSign = catchAsync(async (req, res) => {
	const html = req.body.html
	const filename = req.body.filename

	const filePath = path.join(
		__dirname,
		'..',
		'public',
		'uploads',
		`${filename.replace('.pdf', '-sign-test.pdf')}`
	)

	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.setContent(html, { waitUntil: 'networkidle0' })
	await page.pdf({
		path: filePath,
		format: 'A4',
		printBackground: true,
	})

	await browser.close()
	console.log(`PDF created at ${filePath}`)
	res.status(200).json({ message: 'PDF signed successfully', filename })
})

const mergeSign = catchAsync(async (req, res) => {
	const filename = req.body.filename.replace('.pdf', '-sign.pdf')

	const filenameSign = req.body.filename.replace('.pdf', '-sign-test.pdf')
	const pdfPaths = [filename, filenameSign].map((pdfPath) =>
		path.join(__dirname, '..', 'public', 'uploads', pdfPath)
	)

	const mergedPdf = await PDFDocument.create()
	for (const pdfPath of pdfPaths) {
		const pdfBytes = fs.readFileSync(pdfPath)
		const pdfDoc = await PDFDocument.load(pdfBytes)
		const copiedPages = await mergedPdf.copyPages(
			pdfDoc,
			pdfDoc.getPageIndices()
		)
		copiedPages.forEach((page) => mergedPdf.addPage(page))
	}
	const mergedPdfBytes = await mergedPdf.save()

	// removePDF(filenameSign)

	fs.writeFileSync(
		path.join(__dirname, '..', 'public', 'uploads', filenameSign),
		mergedPdfBytes
	)

	res.status(200).json({ message: 'PDFs merged successfully', filename })
})

module.exports = { createSign, mergeSign }
