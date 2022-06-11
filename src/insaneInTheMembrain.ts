const url = window.location.href

const onMembrain = /membrain/.test(url)

const containerElement = document.querySelector('#container')

const membrainLinkString = `<div class="membrain-link-container"><a href="./membrain.html">hehe</a></div>`

export function addMembrainLink() {
  if (containerElement) {
    containerElement.insertAdjacentHTML('afterend', membrainLinkString)
  }
}

export function insertMembrain() {
  if (containerElement) {
    containerElement.insertAdjacentHTML(
      'afterbegin',
      `<div class="membrane">
        <div class="membrane-top"></div>
        <div class="membrane-bottom"></div>
      </div>`
    )
  }
}

onMembrain && insertMembrain()
