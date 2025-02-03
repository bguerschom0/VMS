
const MOCK_USERS = [
  {
    identityNumber: "1199000000000000",
    phoneNumber: "250788315218",
    fullName: "John Doe",
    gender: "Male",
    photoUrl: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    identityNumber: "1199000000000001",
    phoneNumber: "250785700813",
    fullName: "Jane Smith",
    gender: "Female",
    photoUrl: "https://randomuser.me/api/portraits/women/1.jpg"
  }
];

export const mockIdApi = {
  // Search by ID or phone number
  async searchPerson(searchTerm) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Handle passport case (#00)
    if (searchTerm === "#00") {
      return {
        success: true,
        data: null,
        isPassport: true
      };
    }

    // Search in mock data
    const person = MOCK_USERS.find(user => 
      user.identityNumber === searchTerm || 
      user.phoneNumber === searchTerm
    );

    if (person) {
      return {
        success: true,
        data: person,
        isPassport: false
      };
    }

    return {
      success: false,
      error: "Person not found"
    };
  },

  // Get photo URL
  async getPhoto(identityNumber) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const person = MOCK_USERS.find(user => user.identityNumber === identityNumber);
    return person ? person.photoUrl : null;
  }
};
