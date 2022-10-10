// console.log('Connected.')

const IMAGE_ELEMENT = document.getElementById('image-input');
// const RESULT_AREA = document.getElementById('result-space');
const IMAGE_CANVAS_PARENT = document.getElementsByClassName('column')[0]
// const IMAGE_CANVAS = document.getElementById('image-canvas');
const ASCII_MAP = "`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
const MAX_BRIGHTNESS = 255 * 3
const BRIGHTNESS_WEIGHT = ASCII_MAP.length / MAX_BRIGHTNESS
const OPEN_PAGE = document.getElementById('open-page');
const RESULTS_LINK = document.getElementById('results-link');

const sleep = (ms = 2000) => {
    return new Promise(r => {
        setTimeout(r, ms)
    })
}
function getRandomId(length = 20) {
    const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRRSTUVWXYZ1234567890'
    var randId = ''
    for (var i = 0; i <= length; i++) {
        randId += abc[Math.floor(Math.random() * abc.length)]
    }
    return randId

}

function pixelToCharacter(pixel) {
    var brightness = 0
    for (var i = 0; i <= 2; i++) {
        brightness += pixel[i]
    }
    var index = Math.floor((brightness * BRIGHTNESS_WEIGHT) - 1)
    if (index === -1) {
        index = 0
    }
    return ASCII_MAP[index];
}


IMAGE_ELEMENT.addEventListener('change', (ev) => {
    ev.preventDefault();
    // const imgPath = ev.target.files[0].name | IMAGE_ELEMENT.files
    // const [img] = IMAGE_ELEMENT.files;
    const [file] = IMAGE_ELEMENT.files;
    // console.log(imgPath);
    // console.log(URL.createObjectURL(imgPath));
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.crossOrigin = "anonymous";
    img.addEventListener('load', async () => {
        IMAGE_ELEMENT.setAttribute('disabled', 'true')
        OPEN_PAGE.setAttribute('disabled', 'true')
        try {
            IMAGE_CANVAS_PARENT.removeChild(IMAGE_CANVAS)
            console.log('Already present canvas element deleted.')
        } catch {
            console.log('No canvas present already, so not removing any.')
        }
        IMAGE_CANVAS = document.createElement('canvas')
        IMAGE_CANVAS.setAttribute('id', 'image-canvas')
        IMAGE_CANVAS_PARENT.appendChild(IMAGE_CANVAS)
        const ctx = IMAGE_CANVAS.getContext('2d');
        IMAGE_CANVAS.width = img.width;
        IMAGE_CANVAS.height = img.height;
        ctx.drawImage(img, 0, 0);
        img.style.display = 'none'
        console.log(`Width: ${img.width}, Height: ${img.height}. \n ${img.height} x ${img.width} = ${img.height * img.width} pixel values.`);
        data = ctx.getImageData(1, 1, IMAGE_CANVAS.width, IMAGE_CANVAS.height).data
        data = Array.prototype.slice.call(data)
        slicedArray = []
        for (var i = 0; i < data.length; i += 4) {
            slicedArray.push(data.slice(i, i+4))
        }
        // RESULT_AREA.innerHTML = '';
        // for (var i = 0; i <= slicedArray.length; i+=img.width) {
        //     const lineElems = slicedArray.slice(i, i+img.width);
        //     for (elem of lineElems) {
        //         RESULT_AREA.innerHTML += pixelToCharacter(elem)
        //     }
        //     RESULT_AREA.innerHTML += '\n';
        //     await sleep(0);
        // }
        var payloadData = ''
        for (var i = 0; i <= slicedArray.length; i+=img.width) {
            const lineElems = slicedArray.slice(i, i+img.width);
            for (elem of lineElems) {
                payloadData += pixelToCharacter(elem)
            }
            payloadData += '\n';
            await sleep(0);
        }
        const payload = {
            'id': location.protocol === 'https' ? crypto.randomUUID() : getRandomId(),
            'data': payloadData
        }
        try {
            let save = await fetch(`${location.href}saveData`, {
                method: 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify(payload)
            })
            let res = await save.json()
            console.log(res)
        } catch (err) {
            window.alert(err);
        }
        if (OPEN_PAGE.checked) {
            IMAGE_ELEMENT.removeAttribute('disabled')
            OPEN_PAGE.removeAttribute('disabled')
            window.open(`/${payload.id.toString()}`)
        } else {
            // console.log('Not Checked.')
            IMAGE_ELEMENT.removeAttribute('disabled')
            OPEN_PAGE.removeAttribute('disabled')
            RESULTS_LINK.removeAttribute('hidden');
            RESULTS_LINK.innerHTML = `Conversion completed! Check out results <a href=${location.href}${payload.id}>Here. ↗️</a>`
        }
    })
})