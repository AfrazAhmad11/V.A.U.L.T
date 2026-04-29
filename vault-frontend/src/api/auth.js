import API from './config'

export const register = (data) => API.post('/auth/register', data)

export const login = (data) => API.post('/auth/login', data)

export const getProfile = () => API.get('/users/profile')

export const updateProfile = (data) => API.put('/users/profile', data)
