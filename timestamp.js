let tabID;
chrome.storage.local.get(['key'], function(result) {
    tabID = result.key;
});

//add container
let time_container = document.getElementsByClassName("timestamp_wrapper")[0];
let copied = false;
let dirty = false;
let id_dict = {};

window.addEventListener("beforeunload", (e)=>{
    if(!copied && dirty){
        e.preventDefault();
        e.returnValue = '';
    }
});

document.getElementById("add_new_time").addEventListener('click', () => {
    let inc, dec, rm, container_id, time_id, current_time; // = "00:00:01";
    while (true) {
        inc = Math.random().toString(36).slice(2, 7);
        dec = Math.random().toString(36).slice(2, 7);
        rm = Math.random().toString(36).slice(2, 7);
        container_id = Math.random().toString(36).slice(2, 7);
        time_id = Math.random().toString(36).slice(2, 7);

        if(id_dict[inc] == null || id_dict[dec] == null || id_dict[rm] == null ||
            id_dict[time_id] == null || id_dict[container_id] == null)
        {
            break;
        }
    }
    id_dict[inc] = id_dict[dec] = time_id;
    id_dict[rm] = container_id;
    id_dict[time_id] = id_dict[container_id] = "Na";
    chrome.tabs.sendMessage(tabID, {text: 'time'}, (respond) => {
        current_time = respond.time;
    
        let timestamp_block = `<div id="${container_id}" class="timestamp_container">
        <p id="${time_id}" class="time_text">${current_time}</p>
        <input class="text_input" placeholder="Type notes here..." style="flex: 8">
        <div class="button_container">
            <button id="${dec}" class="button">&lt;</button>
            <button id="${inc}" class="button">&gt;</button>
            <button id="${rm}" class="button">x</button>
        </div>
        </div>`;

        time_container.insertAdjacentHTML('beforeend', timestamp_block);
        document.getElementById(inc).addEventListener("click", function(){button_clicked(inc, "inc");});
        document.getElementById(dec).addEventListener("click", function(){button_clicked(dec, "dec");});
        document.getElementById(rm).addEventListener("click", function(){button_clicked(rm, "rm");});
        dirty = true;
    });
});

document.getElementById("export_timestamp").addEventListener('click', () => {
    let container = document.getElementsByClassName("timestamp_container");
    let copypasta = "";
    for (let index = 0; index < container.length; index++) {
        const element = container[index];
        let text = element.querySelector(".text_input").value;
        let time = element.querySelector(".time_text").textContent;
        copypasta += time + " " + text + "\n";
    }

    navigator.clipboard.writeText(copypasta).then( ()=> {
        copied = true;
        dirty = false;
        alert("Coppied to clipboard.");
    }, (err) => {
        alert("Error can't copy to clipboard: " + err);
    });
});


function button_clicked(id, type) {
    if(type === "rm"){
        document.getElementById(id_dict[id]).remove();
    } else {
        let time_text = document.getElementById(id_dict[id]);
        let current_text = time_text.textContent;
        if(type === "inc"){
            time_text.textContent = change_time_stamp(current_text, +5);
        } else {
            time_text.textContent = change_time_stamp(current_text, -5);
        }
    }
}

function change_time_stamp(time_str, change){
    let a = time_str.split(":")
    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
    seconds += change;

    let h = (seconds / 3600) | 0;
    let m = ((seconds - (h*3600)) / 60) | 0;
    let s = seconds - (h*3600) - (m*60);

    return `${h}:${m}:${s}`;
}