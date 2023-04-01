let tabID
chrome.storage.local.get(['key'], function (result) {
  tabID = result.key
})

//add container
let time_container = document.getElementsByClassName('timestamp_wrapper')[0]
let copied = false
let dirty = false
let id_dict = {}

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['channel']).then(respond => {
    const twitch_channel = `tw_ch_${respond.channel}`

    chrome.storage.local.get([twitch_channel]).then(result => {
      result = Object.values(result)
      if (!result) {
        let empty = {}
        empty[twitch_channel] = []
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
          
          time_container.insertAdjacentHTML('beforeend', timestamp_block)
          document.getElementById(block['input_id']).addEventListener('change', () => {
          backup_timestamps(
            block['container_id'],
            block['time_id'],
            block['dec'],
            block['inc'],
            block['rm'],
            block['current_time'],
            block['input_id']
          )
        })
        document.getElementById(block['inc']).addEventListener('click', e => {
          button_clicked(block['inc'], 'inc', e)
        })
        document.getElementById(block['dec']).addEventListener('click', e => {
          button_clicked(block['dec'], 'dec', e)
        })
        document.getElementById(block['rm']).addEventListener('click', () => {
          button_clicked(block['rm'], 'rm')
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
  let inc, dec, rm, container_id, time_id, input_id, current_time // = "00:00:01";
  while (true) {
    inc = Math.random().toString(36).slice(2, 7)
    dec = Math.random().toString(36).slice(2, 7)
    rm = Math.random().toString(36).slice(2, 7)
    container_id = Math.random().toString(36).slice(2, 7)
    time_id = Math.random().toString(36).slice(2, 7)
    input_id = Math.random().toString(36).slice(2, 7)

    if (
      id_dict[inc] == null ||
      id_dict[dec] == null ||
      id_dict[rm] == null ||
      id_dict[time_id] == null ||
      id_dict[container_id] == null ||
      id_dict[input_id] == null
    ) {
      break
    }
  }
  id_dict[container_id] = 'Na'
  id_dict[time_id] = 'Na'
  id_dict[dec] = time_id
  id_dict[inc] = time_id
  id_dict[rm] = container_id
  chrome.tabs.sendMessage(tabID, { text: 'time' }, respond => {
    current_time = respond.time

    const timestamp_block = `<div id="${container_id}" class="timestamp_container">
            <p id="${time_id}" class="time_text">${current_time}</p>
            <input id="${input_id}" class="text_input" placeholder="Type notes here..." style="flex: 8">
            <div class="button_container">
                <button id="${dec}" class="button" title="Decrease 1 second (press Alt to decrease by 5)">&lt;</button>
                <button id="${inc}" class="button" title="Increase 1 second (press Alt to increase by 5)">&gt;</button>
                <button id="${rm}" class="button" title="Delete tag">x</button>
            </div>
        </div>`

    time_container.insertAdjacentHTML('beforeend', timestamp_block)
    document.getElementById(input_id).addEventListener('change', () => {
      backup_timestamps(
        container_id,
        time_id,
        dec,
        inc,
        rm,
        current_time,
        input_id
      )
    })
    document.getElementById(inc).addEventListener('click', e => {
      button_clicked(inc, 'inc', e)
    })
    document.getElementById(dec).addEventListener('click', e => {
      button_clicked(dec, 'dec', e)
    })
    document.getElementById(rm).addEventListener('click', () => {
      button_clicked(rm, 'rm')
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

function backup_timestamps (
  container_id,
  time_id,
  dec,
  inc,
  rm,
  current_time,
  input_id
) {
  chrome.storage.local.get(['channel']).then(respond => {
    const twitch_channel = `tw_ch_${respond.channel}`
    const store = {
      'container_id': container_id,
      'time_id': time_id,
      'dec': dec,
      'inc': inc,
      'rm': rm,
      'current_time': current_time,
      'input_id': input_id,
      'text': document.getElementById(input_id).value
    }
    chrome.storage.local.get([twitch_channel]).then(result => {
      result = Object.values(result)

      const index = result.findIndex((id) => id['container_id'] === container_id);
      if(index === -1){
        result.push(store)
      } else {
        result[index] = store
      }

      let newResult = {}
      newResult[twitch_channel] = result
      chrome.storage.local.set(newResult)
    })
  })
}
