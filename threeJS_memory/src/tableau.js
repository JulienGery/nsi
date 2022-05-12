import './tableau.css'
export let playerNumbers;

const innerHTML = '<div class="col col-2">Name</div><div class="col col-3" style="padding-left: 2%;padding-right: 2%;;">points</div><div class="col col-4">ready</div>'

const table = document.createElement('div')
table.className = 'container'

const ul = document.createElement('ul')
ul.className = 'responsive-table'

const header = document.createElement('li')
header.className = 'table-header'
header.innerHTML = innerHTML


export const updateTable = (dict) => {
    playerNumbers = dict.length;
    ul.innerHTML = '';
    ul.appendChild(header);

    Object.values(dict).forEach(element => {

        const li = document.createElement('li')
        li.className = 'table-row'
        li.innerHTML = `<div class="col col-2" data-label="Customer Name">${element.name}</div><div class="col col-3" data-label="Amount">${element.points}</div><div class="col col-4" data-label="Payment Status">${element.ready}</div>`
        ul.appendChild(li)

    })
}


ul.appendChild(header)
table.appendChild(ul)
export const addTable = () => {
    document.body.appendChild(table)
}

export const removeTable = () => {
    document.body.removeChild(table)
}