const mockTasks = [
    {
        id: 't1',
        title: 'Emergency Food Distribution',
        category: 'Food Security',
        urgency: 'critical',
        skills: ['Logistics', 'Heavy Lifting', 'Driving'],
        location: 'Downtown Community Center',
        description: 'Need volunteers to help distribute 500 emergency food parcels to affected families in the Downtown area.',
        timestamp: '2 hours ago',
        affectedCount: 500,
        status: 'Pending',
        sdgTag: 'SDG 2: Zero Hunger',
        sdgNumber: 2
    },
    {
        id: 't2',
        title: 'Medical Camp Translation',
        category: 'Medical Assistance',
        urgency: 'high',
        skills: ['Translation', 'Spanish', 'First Aid'],
        location: 'Sector 4 Clinic',
        description: 'Translators needed to assist doctors at the temporary medical camp serving non-English speaking communities.',
        timestamp: '4 hours ago',
        affectedCount: 120,
        status: 'Pending',
        sdgTag: 'SDG 3: Good Health & Well-being',
        sdgNumber: 3
    },
    {
        id: 't3',
        title: 'Temporary Shelter Setup',
        category: 'Emergency Shelter',
        urgency: 'critical',
        skills: ['Construction', 'Coordination'],
        location: 'Southside High School',
        description: 'Urgent help required to set up cots and basic facilities in the school gym for displaced families.',
        timestamp: '5 hours ago',
        affectedCount: 250,
        status: 'In Progress',
        sdgTag: 'SDG 11: Sustainable Cities',
        sdgNumber: 11
    },
    {
        id: 't4',
        title: 'Supplies Inventory Management',
        category: 'Logistics/Transport',
        urgency: 'medium',
        skills: ['Organization', 'Data Entry'],
        location: 'Main Warehouse',
        description: 'Catalog incoming donations and update the central inventory system to optimize distribution.',
        timestamp: '1 day ago',
        affectedCount: 800,
        status: 'Pending',
        sdgTag: 'SDG 10: Reduced Inequalities',
        sdgNumber: 10
    },
    {
        id: 't5',
        title: 'Post-Flood Water Safety Check',
        category: 'Water & Sanitation',
        urgency: 'high',
        skills: ['Physical Labor', 'Sanitation', 'Water Testing'],
        location: 'Riverfront District',
        description: 'Test water sources and distribute purification tablets to households after flood contamination.',
        timestamp: '1 day ago',
        affectedCount: 340,
        status: 'Pending',
        sdgTag: 'SDG 6: Clean Water & Sanitation',
        sdgNumber: 6
    },
    {
        id: 't6',
        title: 'After-School Tutoring Program',
        category: 'Education',
        urgency: 'low',
        skills: ['Teaching', 'Mentoring', 'Child Care'],
        location: 'West End Community Hall',
        description: 'Volunteer tutors needed to support displaced children who have missed schooling due to the emergency.',
        timestamp: '2 days ago',
        affectedCount: 60,
        status: 'Resolved',
        sdgTag: 'SDG 4: Quality Education',
        sdgNumber: 4
    }
];

const mockVolunteers = [
    {
        id: 'v1',
        name: 'Sarah Chen',
        location: 'Downtown',
        skills: ['Medical Help', 'First Aid', 'Translation'],
        availability: 'High',
        avatar: 'https://i.pravatar.cc/150?img=47',
        points: 1250,
        badges: ['Medical Hero', 'Top Responder']
    },
    {
        id: 'v2',
        name: 'Marcus Miller',
        location: 'Sector 4',
        skills: ['Logistics/Supplies', 'Driving', 'Construction'],
        availability: 'Medium',
        avatar: 'https://i.pravatar.cc/150?img=11',
        points: 840,
        badges: ['Logistics Pro']
    },
    {
        id: 'v3',
        name: 'Elena Rodriguez',
        location: 'Westside',
        skills: ['Food Security', 'Cooking', 'Logistics/Supplies'],
        availability: 'High',
        avatar: 'https://i.pravatar.cc/150?img=26',
        points: 2100,
        badges: ['Impact Leader', 'Food Security Star']
    },
    {
        id: 'v4',
        name: 'David Kim',
        location: 'Downtown',
        skills: ['Emergency Shelter', 'First Aid', 'Construction'],
        availability: 'Low',
        avatar: 'https://i.pravatar.cc/150?img=12',
        points: 450,
        badges: ['Shelter Support']
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
