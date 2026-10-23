import { writable } from 'svelte/store'

export const isDark = writable(false)
export const isSideMenuOpen = writable(false)
export const isNotificationsMenuOpen = writable(false)
export const isProfileMenuOpen = writable(false)
export const pageMenus = writable([])
export const choosePoison = writable(false)
export const showAlertMenu = writable<boolean>(false)
export const alertMessage = writable<string>('')
export const alertType = writable<'success' | 'failed' | null>(null)
export const showGifs = writable<boolean>(true)

export const togglePageMenu = (name: string) => {
  pageMenus.update((pages) => {
    if (typeof pages[name] === 'undefined') {
      pages[name] = true
    } else {
      pages[name] = !pages[name]
    }

    return pages
  })
}

export const toggleSideMenu = () => {
  isSideMenuOpen.update((v) => !v)
}

export const closeSideMenu = () => {
  isSideMenuOpen.set(false)
}

export const toggleNotificationsMenu = () => {
  isNotificationsMenuOpen.update((v) => !v)
}

export const closeNotificationsMenu = () => {
  isNotificationsMenuOpen.set(false)
}

export const toggleProfileMenu = () => {
  isProfileMenuOpen.update((v) => !v)
}

export const closeProfileMenu = () => {
  isProfileMenuOpen.set(false)
}

export const toggleChoosePoison = () => {
  choosePoison.update((p) => !p)
}

export const triggerAlertMenu = (msg: string, type: 'success' | 'failed') => {
  alertType.set(type)
  alertMessage.set(msg)
  showAlertMenu.set(true)
}

export const closeAlertMenu = () => {
  showAlertMenu.set(false)
  alertMessage.set('')
  alertType.set(null)
}

export const toggleShowGifs = () => {
  showGifs.update(v => !v)
}

export const setPatient = (patient_id, status) => {
  if (localStorage.patient_id) {
    return false
  }
  else {
    localStorage.setItem('patient_id', patient_id)
    localStorage.setItem('status', status)
    return true
  }
}

export const getPatientStatus = () => {
  return localStorage.status || null
}

export const getPatientId = () => {
  return localStorage.patient_id || null
}
