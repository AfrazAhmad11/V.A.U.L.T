import API from './config'

export const getTournaments = (params) => API.get('/tournaments', { params })

export const getTournamentById = (id) => API.get(`/tournaments/${id}`)

export const createTournament = (data) => API.post('/tournaments', data)

export const joinTournament = (id) => API.post(`/tournaments/${id}/join`)
