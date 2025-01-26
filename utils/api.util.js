const fs = require('fs').promises
const path = require('path')

const { catchAsync } = require('./error.util')

const saveImage = async (base64, destPath) => {
	const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')

	const dirPath = path.dirname(destPath)
	await fs.mkdir(dirPath, { recursive: true })

	await fs.writeFile(destPath, base64Data, { encoding: 'base64' })
}

const populateOptions = [
	{
		path: 'requiredApprovals',
		select: 'email role admin picture name',
	},
	{
		path: 'currentRequiredApproval',
		select: 'email role admin picture name',
	},
	{
		path: 'status.passedApprovals',
		select: 'email role admin picture name',
	},
	{
		path: 'status.currentRequiredApproval',
		select: 'email role admin picture name',
	},
	{
		path: 'status.pendingApprovals',
		select: 'email role admin picture name',
	},
	{
		path: 'raisedBy',
		select: 'email role admin picture name',
	},
	{
		path: 'status.rejectedBy.admin',
		select: 'email role admin picture name',
	},
]

const sendMail = async (to, subject, text, html) => {
	console.log(text)
}

const hierarchyMantained = (requiredApprovals) => {
	if (requiredApprovals.length === 0) return false

	return true
}

const rejectExpiredNotesheet = catchAsync(async () => {
	const notesheets = await notesheetModel.find({
		expiresAt: { $lt: new Date() },
		'status.state': 'pending',
	})

	if (notesheets?.length > 0) {
		notesheets.forEach(async (notesheet) => {
			notesheet.status.rejectedBy.admin =
				notesheet.currentRequiredApproval
			notesheet.status.rejectedBy.comment =
				'Notesheet expired! Please raise a new notesheet.'

			await notesheet.save()

			await removePDF(notesheet.pdf.split('/').pop())

			await removePDF(
				notesheet.thumbnail
					.split('/')
					.pop()
					.replace('.pdf', '-sign.pdf')
			)

			sendMail(
				(text = `Your notesheet with id ${notesheet.id} has been rejected with comment ${comment}`)
			)
		})
	}
})

const removePDF = async (filename) => {
	const filePath = path.join(__dirname, '..', 'public', 'uploads', filename)
	console.log(filePath)

	try {
		await fs.access(filePath)
		await fs.unlink(filePath)
		console.log(`File ${filename} deleted successfully.`)
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.error(`File not found: ${filename}`)
			console.log(`File ${filename} does not exist.`)
		} else {
			console.error(`Error deleting file: ${err.message}`)
		}
	}
}

const renamePDF = async (oldFilename, newFilename) => {
	const oldPath = path.join(__dirname, '..', 'public', 'uploads', oldFilename)
	const newPath = path.join(__dirname, '..', 'public', 'uploads', newFilename)

	try {
		await fs.rename(oldPath, newPath)
		console.log('File renamed successfully')
	} catch (err) {
		console.error('Error renaming file:', err)
	}
}

module.exports = {
	saveImage,
	populateOptions,
	sendMail,
	hierarchyMantained,
	rejectExpiredNotesheet,
	removePDF,
	renamePDF,
}
