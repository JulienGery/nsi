import './progressBar.css'
import './toaster.css'

export const displayToaster = (text = '', backgroundColor = '', color = '', progressBarColor = '') => {
  //TODO rework here
  const snackbar = document.getElementById('snackbar')
  if (snackbar) {
    document.body.removeChild(snackbar)
  }

  const toaster = document.createElement('div')
  toaster.id = 'snackbar'
  // toaster.style.backgroundColor = backgroundColor
  // toaster.style.color = color
  toaster.textContent = text
  toaster.className = 'show'
  // const progressBar = document.createElement('div')
  // progressBar.style.backgroundColor = progressBarColor
  // progressBar.className = 'progress'
  //   toaster.appendChild(progressBar)
  document.body.appendChild(toaster)

  setTimeout(() => {
    const snackbar = document.getElementById('snackbar')
    if (snackbar) {
      document.body.removeChild(snackbar)
    }
  }, 2900)
}
