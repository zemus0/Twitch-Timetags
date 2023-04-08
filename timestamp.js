let tabID
chrome.storage.local.get(['key'], function (result) {
  tabID = result.key
})

//add container
let time_container = document.getElementsByClassName('timestamp_wrapper')[0]
let copied = false
let dirty = false
let twitch_stream
let id_dict = {}

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['stream']).then(respond => {
    twitch_stream = `tw_ch_${respond.stream}`

    chrome.storage.local.get([twitch_stream]).then(result => {
      result = Object.values(result)[0]
      if (!result) {
        let empty = {}
        empty[twitch_stream] = []
        chrome.storage.local.set(empty)
      } else {
        result.forEach(block => {
          const timestamp_block = `<div id="${block['container_id']}" class="timestamp_container">
              <p id="${block['time_id']}" class="time_text">${block['current_time']}</p>
              <input id="${block['input_id']}" class="text_input" placeholder="Type notes here..." style="flex: 8" value="${block['text']}">
              <div class="button_container">
                  <button id="${block['dec']}" class="button" title="Decrease 1 second (press Alt to decrease by 5)">&lt;</button>
                  <button id="${block['inc']}" class="button" title="Increase 1 second (press Alt to increase by 5)">&gt;</button>
                  <button id="${block['rm']}" class="button" title="Delete tag">x</button>
              </div>
          </div>`

          id_dict[block['time_id']] = id_dict[block['container_id']] = 'Na'
          id_dict[block['inc']] = id_dict[block['dec']] = block['time_id']
          id_dict[block['rm']] = block['container_id']
          time_container.insertAdjacentHTML('beforeend', timestamp_block)
          document
            .getElementById(block['input_id'])
            .addEventListener('change', () => {
              backup_timestamps(block)
            })
          document.getElementById(block['inc']).addEventListener('click', e => {
            button_clicked(block['inc'], 'inc', e)
            backup_timestamps(block)
          })
          document.getElementById(block['dec']).addEventListener('click', e => {
            button_clicked(block['dec'], 'dec', e)
            backup_timestamps(block)
          })
          document.getElementById(block['rm']).addEventListener('click', () => {
            button_clicked(block['rm'], 'rm')
            remove_timestamp(block['container_id'])
          })
        })
      }
    })
  })
})

window.addEventListener('beforeunload', e => {
  if (!copied && dirty) {
    e.preventDefault()
    e.returnValue = ''
  }
})

document.getElementById('add_new_time').addEventListener('click', () => {
  let id_obj = {
    container_id: null,
    time_id: null,
    dec: null,
    inc: null,
    rm: null,
    current_time: null,
    input_id: null,
    text: ''
  }
  while (true) {
    id_obj['inc'] = Math.random().toString(36).slice(2, 7)
    id_obj['dec'] = Math.random().toString(36).slice(2, 7)
    id_obj['rm'] = Math.random().toString(36).slice(2, 7)
    id_obj['container_id'] = Math.random().toString(36).slice(2, 7)
    id_obj['time_id'] = Math.random().toString(36).slice(2, 7)
    id_obj['input_id'] = Math.random().toString(36).slice(2, 7)

    if (
      id_dict[id_obj['inc']] == null ||
      id_dict[id_obj['dec']] == null ||
      id_dict[id_obj['rm']] == null ||
      id_dict[id_obj['time_id']] == null ||
      id_dict[id_obj['container_id']] == null ||
      id_dict[id_obj['input_id']] == null
    ) {
      break
    }
  }
  id_dict[id_obj['time_id']] = id_dict[id_obj['container_id']] = 'Na'
  id_dict[id_obj['inc']] = id_dict[id_obj['dec']] = id_obj['time_id']
  id_dict[id_obj['rm']] = id_obj['container_id']
  chrome.tabs.sendMessage(tabID, { text: 'time' }, respond => {
    id_obj['current_time'] = respond.time
    const timestamp_block = `<div id="${id_obj['container_id']}" class="timestamp_container">
              <p id="${id_obj['time_id']}" class="time_text">${id_obj['current_time']}</p>
              <input id="${id_obj['input_id']}" class="text_input" placeholder="Type notes here..." style="flex: 8" value="${id_obj['text']}">
              <div class="button_container">
                  <button id="${id_obj['dec']}" class="button" title="Decrease 1 second (press Alt to decrease by 5)">&lt;</button>
                  <button id="${id_obj['inc']}" class="button" title="Increase 1 second (press Alt to increase by 5)">&gt;</button>
                  <button id="${id_obj['rm']}" class="button" title="Delete tag">x</button>
              </div>
          </div>`

    time_container.insertAdjacentHTML('beforeend', timestamp_block)
    document
      .getElementById(id_obj['input_id'])
      .addEventListener('change', () => {
        backup_timestamps(id_obj)
      })
    document.getElementById(id_obj['inc']).addEventListener('click', e => {
      button_clicked(id_obj['inc'], 'inc', e)
      backup_timestamps(id_obj)
    })
    document.getElementById(id_obj['dec']).addEventListener('click', e => {
      button_clicked(id_obj['dec'], 'dec', e)
      backup_timestamps(id_obj)
    })
    document.getElementById(id_obj['rm']).addEventListener('click', () => {
      button_clicked(id_obj['rm'], 'rm')
      remove_timestamp(id_obj['container_id'])
    })
    dirty = true
  })
})

document.getElementById('export_timestamp').addEventListener('click', () => {
  let container = document.getElementsByClassName('timestamp_container')
  let copypasta = ''
  for (let index = 0; index < container.length; index++) {
    const element = container[index]
    let text = element.querySelector('.text_input').value
    let time = element.querySelector('.time_text').textContent
    copypasta += time + ' ' + text + '\n'
  }

  navigator.clipboard.writeText(copypasta.trim()).then(
    () => {
      copied = true
      dirty = false
      alert('Coppied to clipboard.')
    },
    err => {
      alert("Error can't copy to clipboard: " + err)
    }
  )
})

function button_clicked (id, type, event = '') {
  if (type === 'rm') {
    document.getElementById(id_dict[id]).remove()
  } else {
    let time_text = document.getElementById(id_dict[id])
    let current_text = time_text.textContent
    let change = event.altKey ? 5 : 1
    if (type === 'inc') {
      time_text.textContent = change_time_stamp(current_text, change)
    } else {
      time_text.textContent = change_time_stamp(current_text, -change)
    }
  }
}

function change_time_stamp (time_str, change) {
  let a = time_str.split(':')
  let seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2]
  seconds += change

  let h = (seconds / 3600) | 0
  let m = ((seconds - h * 3600) / 60) | 0
  let s = seconds - h * 3600 - m * 60

  return `${h}:${m}:${s}`
}

function backup_timestamps (store) {
  store['text'] = document.getElementById(store['input_id']).value
  store['current_time'] = document.getElementById(store['time_id']).textContent
  chrome.storage.local.get([twitch_stream]).then(result => {
    result = Object.values(result)[0]
    const index = result.findIndex(
      id => id['container_id'] === store['container_id']
    )
    if (index === -1) {
      result.push(store)
    } else {
      result[index] = store
    }

    let newResult = {}
    newResult[twitch_stream] = result
    chrome.storage.local.set(newResult)
  })
}

function remove_timestamp (container_id) {
  chrome.storage.local.get([twitch_stream]).then(result => {
    result = Object.values(result)[0]
    const index = result.findIndex(id => id['container_id'] === container_id)
    result.splice(index, 1)
    let newResult = {}
    newResult[twitch_stream] = result
    chrome.storage.local.set(newResult)
  })
}
