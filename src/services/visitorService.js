
import { supabase } from './supabase';
import { mockIdApi } from './mockApi';

export const visitorService = {
  // Search for a visitor
  async searchVisitor(searchTerm) {
    try {
      // Check if visitor exists in database and hasn't checked out
      const { data: existingVisitor } = await supabase
        .from('visitors')
        .select('*')
        .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
        .is('exit_timestamp', null)
        .single();

      if (existingVisitor) {
        // Get fresh photo from ID API
        const photoUrl = await mockIdApi.getPhoto(existingVisitor.identity_number);
        return {
          ...existingVisitor,
          photoUrl,
          isExisting: true
        };
      }

      // If not in database, check ID API
      const idApiResponse = await mockIdApi.searchPerson(searchTerm);
      
      if (idApiResponse.isPassport) {
        return { isPassport: true };
      }

      if (idApiResponse.success) {
        return {
          ...idApiResponse.data,
          isExisting: false
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching visitor:', error);
      throw error;
    }
  },

  // Create/Update visitor check-in
  async checkInVisitor(visitorData, username) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .insert([{
          full_name: visitorData.fullName,
          identity_number: visitorData.identityNumber,
          gender: visitorData.gender,
          phone_number: visitorData.phoneNumber,
          visitor_card: visitorData.visitorCard,
          department: visitorData.department,
          purpose: visitorData.purpose,
          items: visitorData.items,
          laptop_brand: visitorData.laptopBrand,
          laptop_serial: visitorData.laptopSerial,
          entry_username: username
        }])
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking in visitor:', error);
      throw error;
    }
  },

  // Check out visitor
  async checkOutVisitor(visitorId, username) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .update({
          exit_timestamp: new Date().toISOString(),
          exit_username: username
        })
        .eq('id', visitorId)
        .is('exit_timestamp', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking out visitor:', error);
      throw error;
    }
  },

  // Get active visitors
  async getActiveVisitors() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .is('exit_timestamp', null)
        .order('entry_timestamp', { ascending: false });

      if (error) throw error;
      
      // Get fresh photos for all visitors
      const visitorsWithPhotos = await Promise.all(
        data.map(async (visitor) => ({
          ...visitor,
          photoUrl: await mockIdApi.getPhoto(visitor.identity_number)
        }))
      );

      return visitorsWithPhotos;
    } catch (error) {
      console.error('Error getting active visitors:', error);
      throw error;
    }
  },

  // Get visitor by ID or phone
  async getVisitorByIdOrPhone(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
        .order('entry_timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Get fresh photo
      if (data) {
        const photoUrl = await mockIdApi.getPhoto(data.identity_number);
        return { ...data, photoUrl };
      }

      return null;
    } catch (error) {
      console.error('Error getting visitor:', error);
      throw error;
    }
  }
};
