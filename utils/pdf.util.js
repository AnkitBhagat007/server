const fs = require('fs/promises')
const path = require('path')
const { catchAsync } = require('./error.util')

const copyPdfFile = catchAsync(async (sourceFilename, newFilename) => {
	const sourceFilePath = path.join(
		__dirname,
		'..',
		'public',
		'uploads',
		sourceFilename
	)

	const newFilePath = path.join(
		__dirname,
		'..',
		'public',
		'uploads',
		newFilename
	)

	await fs.copyFile(sourceFilePath, newFilePath)

	console.log('File copied from:', sourceFilePath)
	console.log('New file created at:', newFilePath)
})

module.exports = { copyPdfFile }
