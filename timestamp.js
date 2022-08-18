let timestamp_block = `<div class="timestamp_container">
<p class="time_text"> TIME </p>
<input class="text_input" placeholder="Type notes here..." style="flex: 8"> <!-- class 'dMCgxJ' is twitch's format text box -->
<div class="button_container">
    <button class="button">&lt;</button>
    <button class="button">&gt;</button>
    <button class="button">x</button>
</div>
</div> `;

//add container
let time_container = document.getElementsByClassName("timestamp_wrapper")[0];

document.getElementById("add_new_time").addEventListener('click', () =>
{
    let current_time = "00:00:01"
    // let current_time = document.getElementsByClassName("live-time")[0].textContent;
    time_container.insertAdjacentHTML('beforeend', timestamp_block.replace(new RegExp("\\bTIME\\b"), current_time));
});

document.getElementById("export_timestamp").addEventListener('click', () =>
{
    alert("copy pasta");
});