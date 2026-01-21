import axios from 'axios';

const base = 'http://localhost:3000';

export const DashboardServices = {
    getAll: async () => (await axios.get(base + "/tenants")).data,
    getRooms: async() => (await axios.get(base + "/rooms")).data,
    getUserInfo: async(guest_name) => (await axios.get(`${base}/users/${guest_name}`)).data,
    getPassword: async (username) => (await axios.get(`${base}/getPassword/${username}`)).data,
    getPayment: async () => (await axios.get(base + "/payments")).data,

    changePassword: async (username,newPassword) => (await axios.put(`${base}/changePassword/${username}`,{password:newPassword})).data,
    changePaid: async (payment_id,rec) => (await axios.put(`${base}/payments/${payment_id}`,rec)).data,

    add: async (rec) => (await axios.post(base + "/tenants", rec)).data,
    addRoom: async (rec) => (await axios.post(base + "/rooms", rec)).data,
    addStudent: async (rec) => (await axios.post(base + "/student", rec)).data,
    addUserInfo: async (rec) => (await axios.post(base + "/users", rec)).data,
    addNewUsername: async (rec) => (await axios.post(base + "/newuser", rec)).data,
    addPayment: async (rec) => (await axios.post(base + "/payments", rec)).data,

    remove: async (booking_id) => (await axios.delete(`${base}/tenants/${booking_id}`)).data,
    removeRoom: async (room_no) => (await axios.delete(`${base}/rooms/${room_no}`)).data,
    removePayment: async (payment_id) => (await axios.delete(`${base}/payments/${payment_id}`)).data,
};