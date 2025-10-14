// services/apiService.js - Complete API Service with Image Support

class ApiService {
  constructor() {
    // Updated to match your Flask server on port 8080
    this.BACKEND_URL = __DEV__ 
      ? 'http://10.0.2.2:8080'  // For Android emulator
      : 'http://192.168.1.100:8080';  // Replace with your computer's IP for physical device
    
    // Increased timeout for image loading
    this.defaultTimeout = 30000; // 30 seconds for images
    
    console.log('🚀 API Service initialized with URL:', this.BACKEND_URL);
  }

  // Helper method to handle fetch requests with timeout
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      console.log(`📤 Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      console.log(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response data received');
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection');
      }
      
      console.error('❌ API Request Error:', error);
      throw error;
    }
  }

  // Test backend connection
  async testConnection() {
    try {
      console.log(`🔍 Testing connection to: ${this.BACKEND_URL}`);
      const response = await this.makeRequest(`${this.BACKEND_URL}/api/mobile/health`);
      console.log('✅ Connection test successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      throw error;
    }
  }

  // Get test data to verify database connection
  async getTestData() {
    try {
      console.log('🧪 Fetching test data...');
      const response = await this.makeRequest(`${this.BACKEND_URL}/api/mobile/test-data`);
      console.log('✅ Test data received');
      return response;
    } catch (error) {
      console.error('❌ Failed to get test data:', error);
      throw error;
    }
  }

  // Fetch approved offers with optional filters (WITH IMAGES)
  async fetchOffers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${this.BACKEND_URL}/api/mobile/offers?${queryString}` 
        : `${this.BACKEND_URL}/api/mobile/offers`;
      
      console.log('🎯 Fetching offers from:', url);
      console.log('📋 Parameters:', params);
      
      const data = await this.makeRequest(url);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch offers');
      }

      console.log('✅ Offers fetched successfully');
      console.log('📊 Total offers:', data.offers?.length || 0);
      console.log('🖼️ Offers with images:', data.statistics?.offersWithImages || 0);
      console.log('📄 Offers without images:', data.statistics?.offersWithoutImages || 0);
      
      // Log sample image data for debugging
      if (data.offers && data.offers.length > 0) {
        const firstOfferWithImage = data.offers.find(o => o.hasImage);
        if (firstOfferWithImage) {
          console.log('🖼️ Sample image data:');
          console.log('   - Title:', firstOfferWithImage.title);
          console.log('   - Has Image:', firstOfferWithImage.hasImage);
          console.log('   - Image URL length:', firstOfferWithImage.imageUrl?.length || 0, 'chars');
          console.log('   - Content Type:', firstOfferWithImage.imageInfo?.contentType);
          console.log('   - File Size:', this.formatBytes(firstOfferWithImage.imageInfo?.size));
        }
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
      throw error;
    }
  }

  // Fetch single offer by ID (WITH FULL DETAILS AND IMAGE)
  async fetchOfferById(offerId) {
    try {
      const url = `${this.BACKEND_URL}/api/mobile/offers/${offerId}`;
      console.log('🎯 Fetching offer details from:', url);
      
      const data = await this.makeRequest(url);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch offer');
      }

      console.log('✅ Offer details fetched successfully');
      console.log('📄 Title:', data.offer?.title);
      console.log('🖼️ Has image:', data.offer?.hasImage);
      
      if (data.offer?.hasImage) {
        console.log('🖼️ Image details:');
        console.log('   - Image URL length:', data.offer.imageUrl?.length || 0, 'chars');
        console.log('   - Content Type:', data.offer.imageInfo?.contentType);
        console.log('   - File Size:', this.formatBytes(data.offer.imageInfo?.size));
        console.log('   - Original Name:', data.offer.imageInfo?.originalName);
      }
      
      // Log business info if available
      if (data.offer?.business) {
        console.log('🏢 Business:', data.offer.business.name);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching offer details:', error);
      throw error;
    }
  }

  // Fetch categories
  async fetchCategories() {
    try {
      const url = `${this.BACKEND_URL}/api/mobile/offers/categories`;
      console.log('📂 Fetching categories from:', url);
      
      const data = await this.makeRequest(url);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      console.log('✅ Categories fetched:', data.count);
      console.log('📂 Categories:', data.categories?.join(', ') || 'None');
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  // Get backend status
  async getBackendStatus() {
    try {
      console.log('🔍 Checking backend status...');
      const response = await this.makeRequest(`${this.BACKEND_URL}/`);
      console.log('✅ Backend status:', response.status);
      return response;
    } catch (error) {
      console.error('❌ Failed to get backend status:', error);
      throw error;
    }
  }

  // Method to change backend URL dynamically
  setBackendUrl(url) {
    this.BACKEND_URL = url;
    console.log(`🔄 Backend URL changed to: ${this.BACKEND_URL}`);
  }

  // Get current backend URL
  getBackendUrl() {
    return this.BACKEND_URL;
  }

  // Validate image URL (base64 data URI format)
  isValidImageUrl(imageUrl) {
    if (!imageUrl) return false;
    return imageUrl.startsWith('data:image/');
  }

  // Get image size in KB from base64
  getImageSizeKB(base64String) {
    if (!base64String) return 0;
    const base64Length = base64String.replace(/^data:image\/\w+;base64,/, '').length;
    return Math.round((base64Length * 3 / 4) / 1024);
  }

  // Format bytes to human-readable format
  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Extract image info from base64 data URI
  extractImageInfo(dataUri) {
    if (!dataUri || !this.isValidImageUrl(dataUri)) {
      return null;
    }

    const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    return {
      mimeType: matches[1],
      base64Data: matches[2],
      sizeKB: this.getImageSizeKB(dataUri),
      isValid: true
    };
  }

  // Debug: Log offer details
  logOfferDetails(offer) {
    if (!offer) {
      console.log('❌ No offer data');
      return;
    }

    console.log('\n📄 ============ OFFER DETAILS ============');
    console.log('🆔 ID:', offer.id);
    console.log('📝 Title:', offer.title);
    console.log('💰 Discount:', offer.discount);
    console.log('📂 Category:', offer.category);
    console.log('📋 Description:', offer.description?.substring(0, 100) + '...');
    
    console.log('\n🖼️ IMAGE INFORMATION:');
    console.log('   Has Image:', offer.hasImage ? '✅ Yes' : '❌ No');
    
    if (offer.hasImage && offer.imageUrl) {
      const imageInfo = this.extractImageInfo(offer.imageUrl);
      if (imageInfo) {
        console.log('   Valid Image:', '✅ Yes');
        console.log('   MIME Type:', imageInfo.mimeType);
        console.log('   Size:', imageInfo.sizeKB, 'KB');
        console.log('   Base64 Length:', imageInfo.base64Data.length, 'chars');
      } else {
        console.log('   Valid Image:', '❌ Invalid format');
      }
      
      if (offer.imageInfo) {
        console.log('   Original Name:', offer.imageInfo.originalName);
        console.log('   File Size:', this.formatBytes(offer.imageInfo.size));
        console.log('   Uploaded At:', offer.imageInfo.uploadedAt);
      }
    }
    
    console.log('\n🏢 BUSINESS INFORMATION:');
    if (offer.business) {
      console.log('   Name:', offer.business.name);
      console.log('   Category:', offer.business.category);
      console.log('   Address:', offer.business.address);
      console.log('   Phone:', offer.business.phone);
      console.log('   Email:', offer.business.email);
      console.log('   Website:', offer.business.website);
    } else {
      console.log('   No business information available');
    }
    
    console.log('\n⏰ VALIDITY INFORMATION:');
    console.log('   Start Date:', offer.startDate || 'Not specified');
    console.log('   End Date:', offer.endDate || 'Not specified');
    console.log('   Currently Active:', offer.isCurrentlyActive ? '✅ Yes' : '❌ No');
    
    if (offer.daysUntilExpiry !== undefined && offer.daysUntilExpiry !== null) {
      console.log('   Days Remaining:', offer.daysUntilExpiry);
      console.log('   Expiring Soon:', offer.isExpiringSoon ? '⚠️ Yes' : '✅ No');
      console.log('   Expired:', offer.isExpired ? '❌ Yes' : '✅ No');
    }
    
    console.log('\n📊 STATUS INFORMATION:');
    console.log('   Admin Status:', offer.adminStatus);
    console.log('   Is Active:', offer.isActive ? '✅ Yes' : '❌ No');
    console.log('   Created At:', offer.createdAt);
    
    console.log('========================================\n');
  }

  // Comprehensive connection test and diagnostics
  async runDiagnostics() {
    console.log('\n🔬 ============================================');
    console.log('🔬 RUNNING COMPREHENSIVE API DIAGNOSTICS');
    console.log('🔬 ============================================\n');
    
    const results = {
      backendUrl: this.BACKEND_URL,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Backend Root Status
    try {
      console.log('1️⃣ Testing backend root endpoint...');
      const status = await this.getBackendStatus();
      results.tests.backendRoot = { 
        status: 'pass', 
        message: status.message,
        version: status.version
      };
      console.log('   ✅ PASSED - Backend is responding');
      console.log('   📌 Message:', status.message);
      console.log('   📌 Version:', status.version);
    } catch (error) {
      results.tests.backendRoot = { 
        status: 'fail', 
        error: error.message 
      };
      console.log('   ❌ FAILED:', error.message);
    }

    // Test 2: Health Check
    try {
      console.log('\n2️⃣ Testing health endpoint...');
      const health = await this.testConnection();
      results.tests.health = { 
        status: 'pass', 
        database: health.database,
        collections: health.collections
      };
      console.log('   ✅ PASSED - Health check successful');
      console.log('   📌 Database:', health.database);
      console.log('   📌 Collections:');
      console.log('      - Offers:', health.collections?.offers || 0);
      console.log('      - Offers with Images:', health.collections?.offersWithImages || 0);
      console.log('      - Businesses:', health.collections?.businesses || 0);
      console.log('      - Users:', health.collections?.users || 0);
    } catch (error) {
      results.tests.health = { 
        status: 'fail', 
        error: error.message 
      };
      console.log('   ❌ FAILED:', error.message);
    }

    // Test 3: Test Data Retrieval
    try {
      console.log('\n3️⃣ Testing data retrieval...');
      const testData = await this.getTestData();
      results.tests.testData = { 
        status: 'pass', 
        counts: testData.counts
      };
      console.log('   ✅ PASSED - Test data retrieved');
      console.log('   📌 Total Offers:', testData.counts?.total_offers || 0);
      console.log('   📌 Approved Offers:', testData.counts?.approved_offers || 0);
      console.log('   📌 Active Offers:', testData.counts?.active_offers || 0);
    } catch (error) {
      results.tests.testData = { 
        status: 'fail', 
        error: error.message 
      };
      console.log('   ❌ FAILED:', error.message);
    }

    // Test 4: Categories
    try {
      console.log('\n4️⃣ Testing categories endpoint...');
      const categories = await this.fetchCategories();
      results.tests.categories = { 
        status: 'pass', 
        count: categories.count,
        categories: categories.categories
      };
      console.log('   ✅ PASSED - Categories fetched');
      console.log('   📌 Total Categories:', categories.count);
      console.log('   📌 Categories:', categories.categories?.join(', ') || 'None');
    } catch (error) {
      results.tests.categories = { 
        status: 'fail', 
        error: error.message 
      };
      console.log('   ❌ FAILED:', error.message);
    }

    // Test 5: Offers with Images
    try {
      console.log('\n5️⃣ Testing offers endpoint with images...');
      const offers = await this.fetchOffers({ page: 1, limit: 5 });
      
      const withImages = offers.offers?.filter(o => o.hasImage).length || 0;
      const withoutImages = offers.offers?.filter(o => !o.hasImage).length || 0;
      
      results.tests.offers = { 
        status: 'pass', 
        count: offers.offers?.length || 0,
        withImages: withImages,
        withoutImages: withoutImages,
        pagination: offers.pagination
      };
      
      console.log('   ✅ PASSED - Offers fetched');
      console.log('   📌 Retrieved:', offers.offers?.length || 0, 'offers');
      console.log('   📌 With Images:', withImages);
      console.log('   📌 Without Images:', withoutImages);
      console.log('   📌 Total Available:', offers.pagination?.totalOffers || 0);
      console.log('   📌 Total Pages:', offers.pagination?.totalPages || 0);
      
      // Test image data integrity
      if (withImages > 0) {
        const sampleOffer = offers.offers.find(o => o.hasImage);
        if (sampleOffer) {
          console.log('\n   🖼️ SAMPLE IMAGE DATA:');
          const imageInfo = this.extractImageInfo(sampleOffer.imageUrl);
          if (imageInfo) {
            console.log('      ✅ Image data is valid');
            console.log('      - MIME Type:', imageInfo.mimeType);
            console.log('      - Size:', imageInfo.sizeKB, 'KB');
            console.log('      - Base64 Length:', imageInfo.base64Data.length.toLocaleString(), 'chars');
          } else {
            console.log('      ❌ Image data is invalid or corrupted');
          }
        }
      }
    } catch (error) {
      results.tests.offers = { 
        status: 'fail', 
        error: error.message 
      };
      console.log('   ❌ FAILED:', error.message);
    }

    // Test 6: Single Offer Details
    try {
      console.log('\n6️⃣ Testing single offer endpoint...');
      // First get an offer ID
      const offersResponse = await this.fetchOffers({ page: 1, limit: 1 });
      
      if (offersResponse.offers && offersResponse.offers.length > 0) {
        const testOfferId = offersResponse.offers[0].id;
        const offerDetails = await this.fetchOfferById(testOfferId);
        
        results.tests.offerDetails = { 
          status: 'pass',
          hasImage: offerDetails.offer?.hasImage,
          title: offerDetails.offer?.title
        };
        
        console.log('   ✅ PASSED - Offer details fetched');
        console.log('   📌 Offer ID:', testOfferId);
        console.log('   📌 Title:', offerDetails.offer?.title);
        console.log('   📌 Has Image:', offerDetails.offer?.hasImage ? 'Yes' : 'No');
        
        if (offerDetails.offer?.hasImage) {
          console.log('   📌 Image Content Type:', offerDetails.offer.imageInfo?.contentType);
          console.log('   📌 Image Size:', this.formatBytes(offerDetails.offer.imageInfo?.size));
        }
      } else {
        results.tests.offerDetails = { 
          status: 'skip', 
          reason: 'No offers available to test' 
        };
        console.log('   ⚠️ SKIPPED - No offers available');
      }
    } catch (error) {
      results.tests.offerDetails = { 
        status: 'fail', 
        error: error.message 
      };
      console.log('   ❌ FAILED:', error.message);
    }

    // Calculate Summary
    const testResults = Object.values(results.tests);
    const passedTests = testResults.filter(t => t.status === 'pass').length;
    const failedTests = testResults.filter(t => t.status === 'fail').length;
    const skippedTests = testResults.filter(t => t.status === 'skip').length;
    const totalTests = testResults.length;
    
    console.log('\n📊 ============================================');
    console.log('📊 DIAGNOSTICS SUMMARY');
    console.log('📊 ============================================');
    console.log('🔗 Backend URL:', this.BACKEND_URL);
    console.log('⏰ Timestamp:', results.timestamp);
    console.log('📈 Tests Passed: ', passedTests, '/', totalTests, `(${Math.round(passedTests/totalTests*100)}%)`);
    console.log('❌ Tests Failed: ', failedTests, '/', totalTests);
    console.log('⚠️  Tests Skipped:', skippedTests, '/', totalTests);
    
    if (passedTests === totalTests) {
      console.log('\n✅ ============================================');
      console.log('✅ ALL TESTS PASSED! BACKEND IS WORKING PERFECTLY!');
      console.log('✅ ============================================\n');
    } else if (failedTests === 0) {
      console.log('\n⚠️ ============================================');
      console.log('⚠️ TESTS COMPLETED WITH SOME SKIPPED');
      console.log('⚠️ ============================================\n');
    } else {
      console.log('\n❌ ============================================');
      console.log('❌ SOME TESTS FAILED - PLEASE CHECK ERRORS ABOVE');
      console.log('❌ ============================================\n');
    }

    return results;
  }

  // Quick image validation test
  async testImageLoading() {
    console.log('\n🖼️ ============================================');
    console.log('🖼️ TESTING IMAGE LOADING');
    console.log('🖼️ ============================================\n');

    try {
      const offers = await this.fetchOffers({ page: 1, limit: 10 });
      const offersWithImages = offers.offers?.filter(o => o.hasImage) || [];
      
      if (offersWithImages.length === 0) {
        console.log('⚠️ No offers with images found in database');
        return { success: false, message: 'No images to test' };
      }

      console.log(`✅ Found ${offersWithImages.length} offers with images\n`);

      offersWithImages.forEach((offer, index) => {
        console.log(`🖼️ Image ${index + 1}:`);
        console.log('   Title:', offer.title);
        
        const imageInfo = this.extractImageInfo(offer.imageUrl);
        if (imageInfo) {
          console.log('   ✅ Valid base64 image data');
          console.log('   - MIME Type:', imageInfo.mimeType);
          console.log('   - Size:', imageInfo.sizeKB, 'KB');
          console.log('   - Recommended for:', imageInfo.sizeKB < 500 ? '✅ Mobile' : '⚠️ May be slow');
        } else {
          console.log('   ❌ Invalid image data format');
        }
        console.log('');
      });

      console.log('✅ Image loading test completed\n');
      return { success: true, count: offersWithImages.length };
    } catch (error) {
      console.error('❌ Image loading test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
export default new ApiService();