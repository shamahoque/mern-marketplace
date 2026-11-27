// Area C (client/) metrics computed like reports/COMPARISON.md: duplication = sum duplicatedLines / sum lines
// from jscpd; maintainability = unweighted mean of Plato reports; SLOC = Plato physical lines.
const fs = require('fs'), path = require('path')
const norm = f => f.split(path.sep).join('/').replace(/\\/g, '/')
const area = f => norm(f).startsWith('client/')
function stats (dir) {
  const j = require(path.resolve(dir, 'jscpd/jscpd-report.json'))
  const src = j.statistics.formats.javascript.sources
  let lines = 0, dup = 0
  for (const [f, s] of Object.entries(src)) if (area(f)) { lines += s.lines; dup += s.duplicatedLines }
  const clones = j.duplicates.filter(d => area(d.firstFile.name) || area(d.secondFile.name)).length
  const p = require(path.resolve(dir, 'plato/report.json'))
  const files = p.reports.filter(r => area(r.info.file))
  const mi = files.reduce((a, r) => a + r.complexity.maintainability, 0) / files.length
  const sloc = files.reduce((a, r) => a + r.complexity.aggregate.complexity.sloc.physical, 0)
  return {
    clientDupPct: +(100 * dup / lines).toFixed(2),
    clientClones: clones,
    clientMaintainability: +mi.toFixed(2),
    clientSloc: sloc,
    clientPlatoFiles: files.length,
    overallDupPct: j.statistics.total.percentage,
    overallClones: j.statistics.total.clones
  }
}
const rows = { baseline: stats('reports/baseline'), 'after A+B': stats('reports/final'), 'after C': stats('reports/final-c') }
console.table(rows)

