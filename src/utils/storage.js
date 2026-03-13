const STORAGE_KEY = 'charty_diagrams'
const ACTIVE_KEY = 'charty_active_diagram'

export function saveDiagram(id, data) {
  try {
    const all = getAllDiagrams()
    all[id] = { ...data, updatedAt: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('Failed to save diagram:', e)
  }
}

export function loadDiagram(id) {
  try {
    const all = getAllDiagrams()
    return all[id] || null
  } catch (e) {
    return null
  }
}

export function getAllDiagrams() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch (e) {
    return {}
  }
}

export function deleteDiagram(id) {
  try {
    const all = getAllDiagrams()
    delete all[id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch (e) {}
}

export function setActiveDiagram(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getActiveDiagram() {
  return localStorage.getItem(ACTIVE_KEY)
}

export function createDiagramId() {
  return `diagram_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
