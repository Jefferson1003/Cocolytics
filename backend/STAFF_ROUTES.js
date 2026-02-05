// Add these routes to your backend/server.js

// ==================== STAFF PROFILES ROUTES ====================

// Get all active staff/sellers with their profiles
app.get('/api/sellers', async (req, res) => {
  try {
    const [sellers] = await pool.execute(
      `SELECT 
        u.id as user_id,
        u.name,
        u.email,
        sp.store_name,
        sp.store_description,
        sp.store_logo,
        sp.contact_number,
        sp.address,
        COUNT(cl.id) as product_count,
        SUM(cl.stock) as total_stock
       FROM users u
       LEFT JOIN staff_profiles sp ON u.id = sp.user_id
       LEFT JOIN cocolumber_logs cl ON u.id = cl.staff_id
       WHERE u.role = 'staff' AND (sp.is_active = TRUE OR sp.is_active IS NULL)
       GROUP BY u.id
       ORDER BY u.name`
    );
    
    res.json(sellers);
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by specific staff/seller
app.get('/api/sellers/:staffId/products', async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const [products] = await pool.execute(
      `SELECT cl.*, u.name as staff_name, sp.store_name
       FROM cocolumber_logs cl
       JOIN users u ON cl.staff_id = u.id
       LEFT JOIN staff_profiles sp ON u.id = sp.user_id
       WHERE cl.staff_id = ? AND cl.stock > 0
       ORDER BY cl.created_at DESC`,
      [staffId]
    );
    
    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get staff profile
app.get('/api/staff/profile', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [profiles] = await pool.execute(
      `SELECT sp.*, u.name, u.email
       FROM staff_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ?`,
      [req.user.id]
    );
    
    if (profiles.length === 0) {
      // Create default profile if doesn't exist
      await pool.execute(
        `INSERT INTO staff_profiles (user_id, store_name, store_description) 
         VALUES (?, ?, ?)`,
        [req.user.id, `${req.user.name}'s Store`, 'Quality coconut products']
      );
      
      return res.json({ 
        user_id: req.user.id, 
        store_name: `${req.user.name}'s Store`,
        store_description: 'Quality coconut products'
      });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update staff profile
app.put('/api/staff/profile', authenticateToken, authorizeRoles('staff', 'admin'), upload.single('store_logo'), async (req, res) => {
  try {
    const { store_name, store_description, contact_number, address } = req.body;
    
    let store_logo = null;
    if (req.file) {
      store_logo = `/uploads/${req.file.filename}`;
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (store_name) {
      updateFields.push('store_name = ?');
      updateValues.push(store_name);
    }
    if (store_description) {
      updateFields.push('store_description = ?');
      updateValues.push(store_description);
    }
    if (contact_number) {
      updateFields.push('contact_number = ?');
      updateValues.push(contact_number);
    }
    if (address) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (store_logo) {
      updateFields.push('store_logo = ?');
      updateValues.push(store_logo);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updateValues.push(req.user.id);
    
    await pool.execute(
      `UPDATE staff_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update the Add Product endpoint to include staff_id
// Modify existing POST /api/staff/cocolumber route:
app.post('/api/staff/cocolumber', authenticateToken, authorizeRoles('staff', 'admin'), upload.single('product_picture'), async (req, res) => {
  try {
    const { size, length, stock } = req.body;

    if (!size || !length || stock === undefined) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Size, length, and stock are required' });
    }

    const productPicture = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert with staff_id
    const [result] = await pool.execute(
      'INSERT INTO cocolumber_logs (size, length, stock, product_picture, staff_id) VALUES (?, ?, ?, ?, ?)',
      [size, length, stock, productPicture, req.user.id]  // Added staff_id
    );

    res.status(201).json({
      success: true,
      message: 'Cocolumber log added successfully',
      data: {
        id: result.insertId,
        size,
        length,
        stock,
        product_picture: productPicture,
        staff_id: req.user.id
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Add cocolumber error:', error);
    res.status(500).json({ message: 'Server error while adding cocolumber log' });
  }
});

// Get staff's own products only
app.get('/api/staff/my-products', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  try {
    const [logs] = await pool.execute(
      'SELECT * FROM cocolumber_logs WHERE staff_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
