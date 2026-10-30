import Papa from 'papaparse'
import { stratify } from 'd3-hierarchy'
import { markRaw } from 'vue'

export function loadCsv(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: reject,
    })
  })
}

export function buildTree(rows) {
  const people = rows.map((r) => ({
    id: r['Employee Id'],
    name: r['Name'],
    title: r['Job Title'],
    department: r['Department'],
    location: r['Location'],
    salary: Number(r['Salary']) || 0,
    managerId: r['Manager'] || null,
  }))

  const root = stratify()
    .id((p) => p.id)
    .parentId((p) => p.managerId)(people)

  addStats(root)

  return markRaw(root)
}

function addStats(root) {
  root.eachAfter((node) => {
    const stats = { descendants: 0, managers: 0, ics: 0, managementCost: 0, icCost: 0 }

    for (const child of node.children || []) {
      const c = child.stats
      stats.descendants += 1 + c.descendants
      stats.managers += c.managers
      stats.ics += c.ics
      stats.managementCost += c.managementCost
      stats.icCost += c.icCost

      if (child.children) {
        stats.managers += 1
        stats.managementCost += child.data.salary
      } else {
        stats.ics += 1
        stats.icCost += child.data.salary
      }
    }

    stats.totalCost = stats.managementCost + stats.icCost
    stats.ratio = stats.managers ? stats.ics / stats.managers : null
    node.stats = stats
  })
}
