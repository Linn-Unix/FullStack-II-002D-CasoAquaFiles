export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function filterCandidates(candidates, search, status) {
  const text = search.trim().toLowerCase()

  return candidates.filter((candidate) => {
    const searchable = `${candidate.name} ${candidate.rut} ${candidate.position} ${candidate.location}`.toLowerCase()
    const matchesText = searchable.includes(text)
    const matchesStatus = status === '' || candidate.status === status
    return matchesText && matchesStatus
  })
}

export function countByStatus(candidates, status) {
  return candidates.filter((candidate) => candidate.status === status).length
}