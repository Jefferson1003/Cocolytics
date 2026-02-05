<template>
  <div class="staff-layout">
    <StaffSidebar />

    <!-- Main Content -->
    <div class="dashboard-container">
      <div class="add-cocolumber-container">
        <div class="header">
          <h1>🌴 Add Coconut Log</h1>
          <p>Insert a new coconut product into the inventory</p>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <div class="info-icon">ℹ️</div>
          <div class="info-content">
            <strong>After adding a product:</strong>
            <p>Go to <router-link to="/staff/inventory">Inventory</router-link> to manage stock (📥 Stock In, 📤 Dispatch, ✏️ Edit)</p>
          </div>
        </div>

    <div class="form-wrapper">
      <form @submit.prevent="submitForm" class="cocolumber-form">
        <!-- Size Input -->
        <div class="form-group">
          <label for="size">Size <span class="required">*</span></label>
          <input
            type="text"
            id="size"
            v-model="formData.size"
            placeholder="e.g., Small, Medium, Large"
            class="form-input"
            required
          />
        </div>

        <!-- Length Input -->
        <div class="form-group">
          <label for="length">Length (cm) <span class="required">*</span></label>
          <input
            type="number"
            id="length"
            v-model.number="formData.length"
            placeholder="e.g., 15.5"
            step="0.01"
            class="form-input"
            required
          />
        </div>

        <!-- Stock Input -->
        <div class="form-group">
          <label for="stock">Current Stock Quantity <span class="required">*</span></label>
          <input
            type="number"
            id="stock"
            v-model.number="formData.stock"
            placeholder="e.g., 100"
            class="form-input"
            required
          />
          <small>Amount currently available in inventory</small>
        </div>

        <!-- Production Target -->
        <div class="form-group">
          <label for="production_target">Production Target (Monthly) <span class="optional">(optional)</span></label>
          <input
            type="number"
            id="production_target"
            v-model.number="formData.production_target"
            placeholder="e.g., 500 - Target units to produce per month"
            class="form-input"
          />
          <small>Set a monthly production goal for this product size</small>
        </div>

        <!-- Product Picture Upload -->
        <div class="form-group">
          <label for="product_picture">Product Picture <span class="optional">(optional)</span></label>
          <div 
            class="drag-drop-zone"
            :class="{ 'drag-over': isDragging }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <input
              type="file"
              id="product_picture"
              @change="handleFileUpload"
              accept="image/*"
              class="file-input"
              ref="fileInput"
            />
            <div v-if="!imagePreview" class="drop-zone-content" @click="triggerFileInput">
              <span class="file-icon">📷</span>
              <p class="drop-text">
                <strong>Drag & Drop</strong> your image here<br>
                or <span class="click-text">click to browse</span>
              </p>
              <span v-if="formData.selectedFile" class="file-name">{{ formData.selectedFile.name }}</span>
            </div>
            
            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview-large">
              <img :src="imagePreview" alt="Preview" />
              <button type="button" @click="removeImage" class="btn-remove-image">✕ Remove</button>
            </div>
          </div>
          <small>Accepted: JPEG, PNG, GIF (Max 5MB) - Drag and drop or click to upload</small>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-submit" :disabled="isLoading">
          <span v-if="!isLoading">✓ Add Coconut</span>
          <span v-else>Loading...</span>
        </button>
      </form>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success">
        <span class="alert-icon">✓</span>
        {{ successMessage }}
        <router-link to="/staff/inventory" class="btn-view-inventory">View Inventory →</router-link>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">✕</span>
        {{ errorMessage }}
      </div>
    </div>

    <!-- All Products Section -->
    <div class="recent-products">
      <div class="section-header-products">
        <h2>📋 All Products in Inventory</h2>
        <div class="product-count">
          <span v-if="!loadingProducts">{{ recentProducts.length }} Product{{ recentProducts.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      
      <div v-if="loadingProducts" class="loading">
        <div class="loading-spinner">⏳</div>
        <p>Loading all products...</p>
      </div>
      
      <div v-else-if="recentProducts.length > 0">
        <div class="products-grid">
          <div v-for="product in recentProducts" :key="product.id" class="product-card" :class="{ 'low-stock': product.stock < 10 }">
            <div class="stock-indicator" v-if="product.stock < 10">
              <span v-if="product.stock === 0">⛔ Out of Stock</span>
              <span v-else-if="product.stock < 5">⚠️ Critical</span>
              <span v-else>⚠️ Low Stock</span>
            </div>
            <div class="product-image">
              <img v-if="product.product_picture" :src="getImageUrl(product.product_picture)" :alt="product.size" />
              <div v-else class="no-image">🥥</div>
            </div>
            <div class="product-info">
              <h3>{{ product.size }}</h3>
              <p><strong>Length:</strong> {{ product.length }} cm</p>
              <p>
                <strong>Stock:</strong> 
                <span class="stock-badge" :class="{ critical: product.stock < 5, warning: product.stock >= 5 && product.stock < 10, available: product.stock >= 10 }">
                  {{ product.stock }} units
                </span>
              </p>
              <p class="date">Added: {{ formatDate(product.created_at) }}</p>
            </div>
            <div class="product-actions">
              <button @click="stockInProduct(product)" class="btn-stock-in" title="Stock In - Add inventory">
                <span class="btn-icon">📥</span>
                <span class="btn-label">Add</span>
              </button>
              <button @click="dispatchProduct(product)" class="btn-dispatch" title="Dispatch - Ship products" :disabled="product.stock === 0">
                <span class="btn-icon">📤</span>
                <span class="btn-label">Dispatch</span>
              </button>
              <button @click="editProduct(product)" class="btn-edit" title="Edit - Update product">
                <span class="btn-icon">✏️</span>
                <span class="btn-label">Edit</span>
              </button>
              <button @click="deleteProduct(product.id)" class="btn-delete" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-products">
        <div class="empty-icon">📦</div>
        <h3>No Products Yet</h3>
        <p>Add your first coconut product using the form above!</p>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingProduct" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>✏️ Edit Product</h2>
          <button class="modal-close" @click="cancelEdit">&times;</button>
        </div>
        <form @submit.prevent="submitEditForm" class="cocolumber-form">
          <div class="form-group">
            <label for="edit-size">Size</label>
            <input
              type="text"
              id="edit-size"
              v-model="editingProduct.size"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-length">Length (cm)</label>
            <input
              type="number"
              id="edit-length"
              v-model.number="editingProduct.length"
              step="0.01"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-stock">Stock Quantity</label>
            <input
              type="number"
              id="edit-stock"
              v-model.number="editingProduct.stock"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-picture">Update Picture (optional)</label>
            <input
              type="file"
              id="edit-picture"
              @change="handleEditFileUpload"
              accept="image/*"
              class="file-input"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isLoading">✓ Update</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stock In Modal -->
    <div v-if="showStockInModal" class="modal-overlay" @click="closeStockInModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>📥 Stock In - {{ selectedProduct?.size }}</h2>
          <button class="modal-close" @click="closeStockInModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-description">
            <p><strong>Add inventory</strong> when receiving new stock from suppliers or production.</p>
          </div>
          <div class="form-group">
            <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
          </div>
          <div class="form-group">
            <label>Quantity to Add <span class="required">*</span></label>
            <input type="number" v-model.number="stockInForm.quantity" class="form-input" min="1" placeholder="Enter quantity to add" />
          </div>
          <div class="form-group">
            <label>Reason (optional)</label>
            <textarea v-model="stockInForm.reason" class="form-input" placeholder="e.g., Supplier delivery, Return from order" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeStockInModal" class="btn-cancel">Cancel</button>
          <button @click="confirmStockIn" class="btn-save">✓ Add Stock</button>
        </div>
      </div>
    </div>

    <!-- Dispatch Modal -->
    <div v-if="showDispatchModal" class="modal-overlay" @click="closeDispatchModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>📤 Dispatch - {{ selectedProduct?.size }}</h2>
          <button class="modal-close" @click="closeDispatchModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-description">
            <p><strong>Dispatch products</strong> when shipping to customers or releasing from warehouse.</p>
          </div>
          <div class="form-group">
            <label>Current Stock: <strong>{{ selectedProduct?.stock }} units</strong></label>
          </div>
          <div class="form-group">
            <label>Quantity to Dispatch <span class="required">*</span></label>
            <input type="number" v-model.number="dispatchForm.quantity" class="form-input" min="1" :max="selectedProduct?.stock" placeholder="Enter quantity to dispatch" />
          </div>
          <div class="form-group">
            <label>Reason (optional)</label>
            <textarea v-model="dispatchForm.reason" class="form-input" placeholder="e.g., Order #123, Customer delivery" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDispatchModal" class="btn-cancel">Cancel</button>
          <button @click="confirmDispatch" class="btn-save">✓ Dispatch</button>
        </div>
      </div>
    </div>
    </div>
  </div>
  </div>
</template>

<script>
import StaffSidebar from '../components/StaffSidebar.vue'

export default {
  name: 'AddCocolumber',
  components: {
    StaffSidebar
  },
  data() {
    return {
      formData: {
        size: '',
        length: '',
        stock: '',
        selectedFile: null
      },
      recentProducts: [],
      imagePreview: null,
      isLoading: false,
      loadingProducts: false,
      successMessage: '',
      errorMessage: '',
      editingProduct: null,
      editingFile: null,
      token: null,
      isDragging: false,
      showStockInModal: false,
      showDispatchModal: false,
      selectedProduct: null,
      stockInForm: {
        quantity: 0,
        reason: ''
      },
      dispatchForm: {
        quantity: 0,
        reason: ''
      }
    };
  },
  mounted() {
    this.token = localStorage.getItem('token');
    this.fetchRecentProducts();
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.processFile(file);
    },
    handleDragOver(event) {
      this.isDragging = true;
    },
    handleDragLeave(event) {
      this.isDragging = false;
    },
    handleDrop(event) {
      this.isDragging = false;
      const file = event.dataTransfer.files[0];
      
      if (file && file.type.startsWith('image/')) {
        this.processFile(file);
      } else {
        this.errorMessage = 'Please drop an image file';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    processFile(file) {
      if (!file) return;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only JPEG, PNG, and GIF images are allowed';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }
      
      this.formData.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleEditFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.editingFile = file;
      }
    },
    removeImage() {
      this.formData.selectedFile = null;
      this.imagePreview = null;
      const fileInput = this.$el.querySelector('#product_picture');
      if (fileInput) {
        fileInput.value = '';
      }
    },
    async submitForm() {
      if (!this.formData.size || !this.formData.length || this.formData.stock === '') {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }

      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        const formDataObj = new FormData();
        formDataObj.append('size', this.formData.size);
        formDataObj.append('length', this.formData.length);
        formDataObj.append('stock', this.formData.stock);
        
        if (this.formData.selectedFile) {
          formDataObj.append('product_picture', this.formData.selectedFile);
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/cocolumber`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formDataObj
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to add coconut log');
        }

        this.successMessage = '✓ Product added successfully! Go to Inventory to view, dispatch, or edit.';
        this.resetForm();
        this.fetchRecentProducts();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      } catch (error) {
        this.errorMessage = error.message || 'Error adding coconut log';
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async submitEditForm() {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        const formDataObj = new FormData();
        formDataObj.append('size', this.editingProduct.size);
        formDataObj.append('length', this.editingProduct.length);
        formDataObj.append('stock', this.editingProduct.stock);
        
        if (this.editingFile) {
          formDataObj.append('product_picture', this.editingFile);
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/cocolumber/${this.editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formDataObj
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update coconut log');
        }

        this.successMessage = 'Cocolumber log updated successfully!';
        this.editingProduct = null;
        this.editingFile = null;
        this.fetchRecentProducts();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = error.message || 'Error updating cocolumber log';
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    },
    editProduct(product) {
      this.editingProduct = { ...product };
      this.editingFile = null;
    },
    cancelEdit() {
      this.editingProduct = null;
      this.editingFile = null;
    },
    async deleteProduct(id) {
      if (!confirm('Are you sure you want to delete this cocolumber log?')) {
        return;
      }

      this.loadingProducts = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/cocolumber/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete cocolumber log');
        }

        this.successMessage = 'Coconut log deleted successfully!';
        this.fetchRecentProducts();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = error.message || 'Error deleting cocolumber log';
        console.error('Error:', error);
      } finally {
        this.loadingProducts = false;
      }
    },
    async fetchRecentProducts() {
      this.loadingProducts = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/cocolumber`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch cocolumber logs');
        }

        this.recentProducts = data.data || [];
      } catch (error) {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Failed to load cocolumber logs';
      } finally {
        this.loadingProducts = false;
      }
    },
    resetForm() {
      this.formData = {
        size: '',
        length: '',
        stock: '',
        selectedFile: null
      };
      this.imagePreview = null;
      const fileInput = this.$el.querySelector('#product_picture');
      if (fileInput) {
        fileInput.value = '';
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    },
    getImageUrl(imagePath) {
      if (!imagePath) return '';
      // If it's already a full URL, return it
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // If it starts with /, it's already a root path
      if (imagePath.startsWith('/')) {
        return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`;
      }
      // Otherwise, assume it's in the uploads folder
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/${imagePath}`;
    },
    // Stock In Methods
    stockInProduct(product) {
      this.selectedProduct = product;
      this.stockInForm = { quantity: 0, reason: '' };
      this.showStockInModal = true;
    },
    closeStockInModal() {
      this.showStockInModal = false;
      this.selectedProduct = null;
      this.stockInForm = { quantity: 0, reason: '' };
    },
    async confirmStockIn() {
      if (!this.stockInForm.quantity || this.stockInForm.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.selectedProduct.id}/stock-in`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              quantity: this.stockInForm.quantity,
              reason: this.stockInForm.reason || null
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add stock');
        }

        this.successMessage = `✓ Added ${this.stockInForm.quantity} units to ${this.selectedProduct.size}!`;
        this.closeStockInModal();
        this.fetchRecentProducts();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error adding stock:', error);
        this.errorMessage = 'Failed to add stock: ' + error.message;
        setTimeout(() => this.errorMessage = '', 4000);
      }
    },
    // Dispatch Methods
    dispatchProduct(product) {
      this.selectedProduct = product;
      this.dispatchForm = { quantity: 0, reason: '' };
      this.showDispatchModal = true;
    },
    closeDispatchModal() {
      this.showDispatchModal = false;
      this.selectedProduct = null;
      this.dispatchForm = { quantity: 0, reason: '' };
    },
    async confirmDispatch() {
      if (!this.dispatchForm.quantity || this.dispatchForm.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/cocolumber/${this.selectedProduct.id}/dispatch`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              quantity: this.dispatchForm.quantity,
              reason: this.dispatchForm.reason || null
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to dispatch');
        }

        this.successMessage = `✓ Dispatched ${this.dispatchForm.quantity} units of ${this.selectedProduct.size}!`;
        this.closeDispatchModal();
        this.fetchRecentProducts();
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error dispatching stock:', error);
        this.errorMessage = 'Failed to dispatch: ' + error.message;
        setTimeout(() => this.errorMessage = '', 4000);
      }
    }
  }
};
</script>

<style scoped>
.header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 15px;
}

.header h1 {
  font-size: 2.5em;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.header p {
  font-size: 1.1em;
  opacity: 0.95;
}

.info-box {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.info-icon {
  font-size: 1.5em;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-content strong {
  color: white;
  display: block;
  margin-bottom: 4px;
  font-size: 0.95em;
}

.info-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
}

.info-content a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.info-content a:hover {
  color: #93c5fd;
  text-decoration: underline;
}

.form-wrapper {
  background: linear-gradient(135deg, rgba(36, 68, 66, 0.6) 0%, rgba(30, 30, 63, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.cocolumber-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
  font-size: 0.95em;
}

.required {
  color: #e74c3c;
  margin-left: 2px;
}

.optional {
  color: #95a5a6;
  font-size: 0.85em;
  margin-left: 5px;
}

.form-input {
  padding: 12px 15px;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
  background: #1a1a2e;
  color: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
}

.file-input {
  display: none;
}

.drag-drop-zone {
  position: relative;
  border: 3px dashed #667eea;
  border-radius: 12px;
  background: #1a1a2e;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-drop-zone.drag-over {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #764ba2;
  border-style: solid;
  transform: scale(1.02);
}

.drop-zone-content {
  text-align: center;
  padding: 40px 20px;
  cursor: pointer;
  width: 100%;
}

.file-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 15px;
}

.drop-text {
  color: #a8b3ff;
  font-size: 1em;
  margin: 10px 0;
  line-height: 1.6;
}

.drop-text strong {
  color: #667eea;
  font-weight: 600;
}

.click-text {
  color: #764ba2;
  text-decoration: underline;
  font-weight: 500;
}

.file-name {
  display: block;
  margin-top: 10px;
  color: #95a5a6;
  font-size: 0.9em;
  font-style: italic;
}

small {
  color: #95a5a6;
  margin-top: 5px;
  font-size: 0.85em;
  display: block;
}

.image-preview-large {
  position: relative;
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.image-preview-large img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-remove-image {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-remove-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(231, 76, 60, 0.4);
}

.btn-remove-image:hover {
  background: rgba(231, 76, 60, 1);
}

.btn-submit {
  grid-column: 1 / -1;
  padding: 14px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  margin-top: 15px;
  flex-wrap: wrap;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-icon {
  font-size: 1.2em;
}

.btn-view-inventory {
  margin-left: auto;
  padding: 8px 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-view-inventory:hover {
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.alert-icon {
  font-size: 1.2em;
}

.recent-products {
  background: #242442;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  margin-top: 40px;
}

.section-header-products {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.recent-products h2 {
  color: #667eea;
  margin: 0;
  font-size: 1.8em;
}

.product-count {
  background: rgba(102, 126, 234, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  color: #667eea;
  font-weight: 600;
  font-size: 0.95em;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #242442 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card.low-stock {
  border-color: rgba(255, 193, 7, 0.5);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, #1a1a2e 100%);
}

.stock-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 193, 7, 0.9);
  color: #1a1a2e;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: 700;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.product-card.low-stock .stock-indicator {
  background: rgba(255, 193, 7, 0.95);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
}

.product-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 3em;
}

.product-info {
  padding: 20px;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1.3em;
}

.product-info p {
  margin: 8px 0;
  color: #aaa;
  font-size: 0.95em;
}

.stock-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 600;
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
}

.stock-badge.warning {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.stock-badge.critical {
  background: rgba(244, 67, 54, 0.2);
  color: #ff6b6b;
}

.stock-badge.available {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
}

.product-info .date {
  color: #95a5a6;
  font-size: 0.85em;
  margin-top: 10px;
}

.product-actions {
  display: flex;
  gap: 8px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  flex-wrap: wrap;
  justify-content: center;
}

.product-actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  flex: 1;
  min-width: 80px;
  justify-content: center;
}

.btn-stock-in {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.2) 100%);
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.btn-stock-in:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(76, 175, 80, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-dispatch {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.2) 100%);
  border: 1px solid rgba(33, 150, 243, 0.4);
}

.btn-dispatch:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(33, 150, 243, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-dispatch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-dispatch:disabled:hover {
  transform: none;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.2) 100%);
}

.btn-edit {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(102, 126, 234, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.4);
}

.btn-edit:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(102, 126, 234, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-delete {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.2) 100%);
  border: 1px solid rgba(244, 67, 54, 0.4);
  flex: 0;
  min-width: auto;
}

.btn-delete:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(244, 67, 54, 0.3) 100%);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .btn-label {
    display: none;
  }
  .product-actions button {
    min-width: 50px;
    padding: 10px;
  }
}

.btn-edit,
.btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1em;
  transition: all 0.2s;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
  background: #bbdefb;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #ffcdd2;
}

.no-products {
  text-align: center;
  color: #95a5a6;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-products h3 {
  color: #667eea;
  margin: 0 0 10px 0;
  font-size: 1.5em;
}

.no-products p {
  color: #95a5a6;
  font-size: 1.1em;
  margin: 0;
}

.loading {
  text-align: center;
  color: #667eea;
  padding: 60px 20px;
}

.loading-spinner {
  font-size: 3em;
  margin-bottom: 15px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.1em;
  margin: 0;
}

@media (max-width: 768px) {
  .add-cocolumber-container {
    padding: 20px 15px;
  }

  .header h1 {
    font-size: 2em;
  }

  .form-wrapper,
  .recent-products {
    padding: 25px 20px;
  }

  .cocolumber-form {
    grid-template-columns: 1fr;
  }

  .btn-submit {
    grid-column: 1;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}

/* Staff Layout & Sidebar Styles */
.staff-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  background-attachment: fixed;
  padding-top: 70px;
}

.dashboard-container {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.add-cocolumber-container {
  width: 100%;
  padding: 20px 0;
  background: transparent;
  min-height: auto;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  background: #242442;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  color: #fff;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8em;
  color: #95a5a6;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 20px 25px;
  color: #fff;
}

.modal-description {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.modal-description p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95em;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #333;
  justify-content: flex-end;
}

.btn-save {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.2s;
}

.btn-save:active {
  transform: scale(0.98);
}

.btn-logout {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #c0392b;
}

.btn-cancel {
  padding: 10px 20px;
  background: #444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #555;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .sidebar.collapsed {
    width: 60px;
  }

  .dashboard-container {
    margin-left: 200px;
  }

  .sidebar.collapsed ~ .dashboard-container {
    margin-left: 60px;
  }

  .add-cocolumber-container {
    padding: 15px;
  }
}
</style>
