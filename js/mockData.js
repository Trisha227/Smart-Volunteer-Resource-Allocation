const mockTasks = [
    {
        id: 't1',
        title: 'Emergency Food Distribution',
        category: 'Food Security',
        urgency: 'critical',
        skills: ['Logistics', 'Heavy Lifting', 'Driving'],
        location: 'Downtown Community Center',
        description: 'Need volunteers to help distribute 500 emergency food parcels to affected families.',
        timestamp: '2 hours ago'
    },
    {
        id: 't2',
        title: 'Medical Camp Translation',
        category: 'Medical Assistance',
        urgency: 'high',
        skills: ['Translation', 'Spanish', 'First Aid'],
        location: 'Sector 4 Clinic',
        description: 'Translators needed to assist doctors at the temporary medical camp.',
        timestamp: '4 hours ago'
    },
    {
        id: 't3',
        title: 'Temporary Shelter Setup',
        category: 'Shelter',
        urgency: 'critical',
        skills: ['Construction', 'Coordination'],
        location: 'Southside High School',
        description: 'Urgent help required to set up cots and basic facilities in the school gym.',
        timestamp: '5 hours ago'
    },
    {
        id: 't4',
        title: 'Supplies Inventory Management',
        category: 'Logistics',
        urgency: 'medium',
        skills: ['Organization', 'Data Entry'],
        location: 'Main Warehouse',
        description: 'Catalog incoming donations and update the central inventory system.',
        timestamp: '1 day ago'
    },
    {
        id: 't5',
        title: 'Post-Flood Cleanup',
        category: 'Sanitation',
        urgency: 'high',
        skills: ['Physical Labor', 'Sanitation'],
        location: 'Riverfront District',
        description: 'Help clear debris and clean up mud from community spaces.',
        timestamp: '1 day ago'
    }
];

const mockVolunteers = [
    {
        id: 'v1',
        name: 'Alex Rivera',
        avatar: 'https://i.pravatar.cc/150?img=11',
        skills: ['Driving', 'Logistics', 'Spanish'],
        location: 'Downtown',
        availability: 'High'
    },
    {
        id: 'v2',
        name: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/150?img=5',
        skills: ['First Aid', 'Translation', 'Organization'],
        location: 'Sector 4',
        availability: 'Medium'
    },
    {
        id: 'v3',
        name: 'Marcus Johnson',
        avatar: 'https://i.pravatar.cc/150?img=33',
        skills: ['Construction', 'Heavy Lifting', 'Physical Labor'],
        location: 'Southside',
        availability: 'High'
    },
    {
        id: 'v4',
        name: 'Elena Rostova',
        avatar: 'https://i.pravatar.cc/150?img=44',
        skills: ['Data Entry', 'Organization', 'Coordination'],
        location: 'West End',
        availability: 'Low'
    },
    {
        id: 'v5',
        name: 'David Smith',
        avatar: 'https://i.pravatar.cc/150?img=12',
        skills: ['Driving', 'Heavy Lifting'],
        location: 'Riverfront',
        availability: 'High'
    }
];

const mockFacilities = [
    {
        id: 'f1',
        name: 'Downtown Shelter',
        type: 'Shelter',
        location: 'Downtown',
        occupancy: 85,
        capacity: 100,
        status: 'Operational',
        needs: ['Blankets', 'Water Supplies'],
        lastChecked: '1 hour ago'
    },
    {
        id: 'f2',
        name: 'Community Clinic',
        type: 'Medical',
        location: 'Sector 4',
        occupancy: 40,
        capacity: 60,
        status: 'Warning',
        needs: ['Medical Staff', 'Bandages'],
        lastChecked: '3 hours ago'
    },
    {
        id: 'f3',
        name: 'West End School',
        type: 'Education/Emergency',
        location: 'West End',
        occupancy: 0,
        capacity: 200,
        status: 'Idle',
        needs: ['Cots'],
        lastChecked: '1 day ago'
    }
];

const mockTrends = {
    needsByCategory: [
        { category: 'Food Security', count: 45, trend: '+12%' },
        { category: 'Medical Help', count: 32, trend: '-5%' },
        { category: 'Emergency Shelter', count: 28, trend: '+20%' },
        { category: 'Logistics/Supplies', count: 15, trend: '+2%' }
    ],
    weeklyResolution: [65, 78, 45, 90, 82, 55, 70], // % resolved over 7 days
    topAreas: [
        { area: 'Downtown', status: 'High Activity' },
        { area: 'Sector 4', status: 'Improving' },
        { area: 'Southside', status: 'Critical' }
    ]
};
