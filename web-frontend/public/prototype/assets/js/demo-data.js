// demo-data.js - South African Mock Data
const easyGoData = {
    users: [
        {
            id: 1,
            name: 'Thabo Nkosi',
            email: 'thabo.nkosi@gmail.com',
            phone: '+27 71 234 5678',
            type: 'rider',
            location: 'Sandton, Johannesburg',
            joined: '2024-01-15',
            trips: 45,
            rating: 4.9
        },
        {
            id: 2,
            name: 'Lerato Molefe',
            email: 'lerato.m@webmail.co.za',
            phone: '+27 83 456 7890',
            type: 'rider',
            location: 'Durban Central',
            joined: '2024-02-20',
            trips: 23,
            rating: 4.7
        },
        {
            id: 3,
            name: 'Sipho Dlamini',
            email: 'sipho.d@easygo.co.za',
            phone: '+27 82 345 6789',
            type: 'driver',
            location: 'Midrand, Johannesburg',
            joined: '2024-01-10',
            trips: 890,
            rating: 4.8,
            vehicle: 'Toyota Corolla 2022',
            license: 'GP 123-456'
        },
        {
            id: 4,
            name: 'Nomsa Zwane',
            email: 'nomsa.z@easygo.co.za',
            phone: '+27 72 567 8901',
            type: 'driver',
            location: 'Cape Town CBD',
            joined: '2024-02-05',
            trips: 567,
            rating: 4.9,
            vehicle: 'Hyundai i20 2023',
            license: 'CA 789-012'
        },
        {
            id: 5,
            name: 'Bongani Mkhize',
            email: 'bongani.m@easygo.co.za',
            type: 'admin',
            role: 'Operations Manager',
            location: 'Johannesburg HQ'
        }
    ],

    rides: [
        {
            id: 'R001',
            rider: 'Thabo Nkosi',
            driver: 'Sipho Dlamini',
            pickup: 'Sandton City, Johannesburg',
            dropoff: 'OR Tambo International Airport',
            distance: '25 km',
            fare: 350.00,
            status: 'completed',
            date: '2024-11-20T09:30:00',
            rating: 5
        },
        {
            id: 'R002',
            rider: 'Lerato Molefe',
            driver: 'Nomsa Zwane',
            pickup: 'Gateway Theatre, Durban',
            dropoff: 'Umhlanga Ridge',
            distance: '8 km',
            fare: 120.00,
            status: 'completed',
            date: '2024-11-20T14:15:00',
            rating: 4
        },
        {
            id: 'R003',
            rider: 'Thabo Nkosi',
            driver: 'Sipho Dlamini',
            pickup: 'Melrose Arch, Johannesburg',
            dropoff: 'Fourways Mall',
            distance: '12 km',
            fare: 180.00,
            status: 'ongoing',
            date: '2024-11-21T10:00:00',
            rating: null
        }
    ],

    drivers: [
        {
            id: 101,
            name: 'Sipho Dlamini',
            photo: 'https://randomuser.me/api/portraits/men/2.jpg',
            vehicle: 'Toyota Corolla',
            license: 'GP 123-456',
            rating: 4.8,
            trips: 890,
            status: 'online',
            location: 'Sandton',
            phone: '+27 82 345 6789'
        },
        {
            id: 102,
            name: 'Nomsa Zwane',
            photo: 'https://randomuser.me/api/portraits/women/3.jpg',
            vehicle: 'Hyundai i20',
            license: 'CA 789-012',
            rating: 4.9,
            trips: 567,
            status: 'online',
            location: 'Cape Town CBD',
            phone: '+27 72 567 8901'
        },
        {
            id: 103,
            name: 'Thabo Mokoena',
            photo: 'https://randomuser.me/api/portraits/men/4.jpg',
            vehicle: 'Volkswagen Polo',
            license: 'GP 456-789',
            rating: 4.7,
            trips: 345,
            status: 'offline',
            location: 'Pretoria',
            phone: '+27 73 456 7890'
        }
    ],

    payments: [
        {
            id: 'P001',
            rideId: 'R001',
            amount: 350.00,
            method: 'Credit Card',
            status: 'paid',
            date: '2024-11-20T09:45:00'
        },
        {
            id: 'P002',
            rideId: 'R002',
            amount: 120.00,
            method: 'SnapScan',
            status: 'paid',
            date: '2024-11-20T14:30:00'
        }
    ],

    southAfricanCities: [
        'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 
        'Port Elizabeth', 'Bloemfontein', 'East London', 
        'Pietermaritzburg', 'Polokwane', 'Nelspruit'
    ],

    popularRoutes: [
        { from: 'Sandton City', to: 'OR Tambo Airport', fare: 350 },
        { from: 'V&A Waterfront', to: 'Cape Town International', fare: 250 },
        { from: 'Gateway Theatre', to: 'Umhlanga', fare: 120 },
        { from: 'Menlyn Maine', to: 'Pretoria CBD', fare: 180 }
    ]
};

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = easyGoData;
}
