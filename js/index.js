const resultCanvas = document.getElementById('resultCanvas')
const flagSelect = document.getElementById('flagSelect')
const paddingRange = document.getElementById('paddingRange')
const flagOpacityRange = document.getElementById('flagOpacity')
const circularImageCheckbox = document.getElementById('circularImageCheckbox')
const dontAdjustImageCheckbox = document.getElementById('dontAdjustImageCheckbox')
const imageInput = document.getElementById('imageUploadInput')
const downloadButton = document.getElementById('downloadCanvas')

const resultCanvasContext = resultCanvas.getContext('2d')

const fileReader = new FileReader()

const loadedImage = src => new Promise(resolve => {
    const image = new Image()
    image.src = src
    image.onload = () => resolve(image)
})

const initFlagCanvas = async (flagUrl, size, opacity) => {
    const flag = await loadedImage(flagUrl)
    resultCanvas.width = size
    resultCanvas.height = size

    resultCanvasContext.save()
    resultCanvasContext.globalAlpha = opacity
    resultCanvasContext.drawImage(flag, 0, 0, size, size)
    resultCanvasContext.restore()
}

const addImageToCanvas = (imageFile, padding, isCircular, adjustImageToPadding) => {
    fileReader.readAsDataURL(imageFile)

    fileReader.onloadend = async () => {
        const profilePictureAsImage = await loadedImage(fileReader.result)
        const canvasSize = resultCanvas.width
        const canvasCenter = canvasSize * 0.5

        const radius = canvasCenter - padding
        const start = canvasCenter - radius
        const size = resultCanvas.width - (start * 2)

        resultCanvasContext.save()
        resultCanvasContext.beginPath()

        if (isCircular) {
            resultCanvasContext.arc(canvasCenter, canvasCenter, radius, 0, Math.PI * 2, true)
        } else {
            resultCanvasContext.rect(start, start, size, size)
        }

        resultCanvasContext.closePath()
        resultCanvasContext.clip()

        if (adjustImageToPadding) {
            resultCanvasContext.drawImage(profilePictureAsImage,start, start,size, size)
        } else {
            resultCanvasContext.drawImage(profilePictureAsImage, 0, 0, resultCanvas.width, resultCanvas.height)
        }

    }
}

const redrawCanvas = async () => {
    const flagToUse = flagSelect.value ?? 'german.png'
    const file = imageInput.files[0]
    const flagOpacity = flagOpacityRange.value / 100

    await initFlagCanvas(flagToUse, resultCanvas.width, flagOpacity)

    if (file) {
        const padding = paddingRange.value
        const isCircular = circularImageCheckbox.checked
        const adjustImage = !dontAdjustImageCheckbox.checked

        addImageToCanvas(file, padding, isCircular, adjustImage)
    }
}

window.onload = () => {
    const redrawCallbackElements = [
        flagSelect, flagOpacityRange, imageInput, paddingRange,
        circularImageCheckbox, dontAdjustImageCheckbox
    ]

    for (let redrawCallbackElement of redrawCallbackElements) {
        redrawCallbackElement.oninput = () => redrawCanvas()
        redrawCallbackElement.onchange = () => redrawCanvas()
    }

    redrawCanvas()
}

downloadButton.onclick = event => {
    event.preventDefault()

    const randomFileName = (Math.random() + 1).toString(36).substring(7)

    const downloadLink = document.createElement('a')
    downloadLink.href = resultCanvas.toDataURL('image/png')
    downloadLink.download = randomFileName
    downloadLink.click()
}