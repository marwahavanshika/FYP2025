import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssets, createAsset, updateAsset, deleteAsset, clearAssetSuccess, clearAssetError } from '../store/assetsSlice';

const Assets = () => {
  const dispatch = useDispatch();
  const { assets, loading, error, success, message } = useSelector(state => state.assets);
  const { user } = useSelector(state => state.auth);
  
  // States for filtering and pagination
  const [filters, setFilters] = useState({
    asset_type: '',
    status: '',
    location: '',
    skip: 0,
    limit: 10
  });
  
  // States for asset form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    asset_type: '',
    description: '',
    location: '',
    status: 'available',
    condition: 'good',
    purchase_date: '',
    warranty_until: ''
  });
  
  // Asset type options
  const assetTypes = ['furniture', 'electronics', 'appliance', 'fixture', 'other'];
  
  // Status options
  const statusOptions = ['available', 'in_use', 'under_repair', 'discarded'];
  
  // Condition options
  const conditionOptions = ['good', 'fair', 'poor'];
  
  // Fetch assets on component mount and when filters change
  useEffect(() => {
    dispatch(fetchAssets(filters));
  }, [dispatch, filters]);
  
  // Clear success and error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearAssetSuccess());
        dispatch(clearAssetError());
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [success, error, dispatch]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset pagination when filters change
    }));
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open form for creating a new asset
  const openCreateForm = () => {
    setFormData({
      name: '',
      asset_type: '',
      description: '',
      location: '',
      status: 'available',
      condition: 'good',
      purchase_date: '',
      warranty_until: ''
    });
    setEditingAsset(null);
    setIsFormOpen(true);
  };
  
  // Open form for editing an existing asset
  const openEditForm = (asset) => {
    const purchaseDate = asset.purchase_date ? asset.purchase_date.split('T')[0] : '';
    const warrantyUntil = asset.warranty_until ? asset.warranty_until.split('T')[0] : '';
    
    setFormData({
      name: asset.name,
      asset_type: asset.asset_type,
      description: asset.description || '',
      location: asset.location,
      status: asset.status,
      condition: asset.condition,
      purchase_date: purchaseDate,
      warranty_until: warrantyUntil
    });
    setEditingAsset(asset);
    setIsFormOpen(true);
  };
  
  // Close the form
  const closeForm = () => {
    setIsFormOpen(false);
  };
  
  // Submit the form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAsset) {
      // Update existing asset
      dispatch(updateAsset({
        id: editingAsset.id,
        assetData: formData
      }));
    } else {
      // Create new asset
      dispatch(createAsset(formData));
    }
    
    closeForm();
  };
  
  // Delete an asset
  const handleDelete = (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      dispatch(deleteAsset(assetId));
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if user has permission to manage assets
  const canManageAssets = user && (user.role === 'admin' || user.role === 'staff');
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'badge-success';
      case 'in_use':
        return 'badge-info';
      case 'under_repair':
        return 'badge-warning';
      case 'discarded':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };
  
  // Get condition badge class
  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'good':
        return 'badge-success';
      case 'fair':
        return 'badge-warning';
      case 'poor':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asset Management</h1>
        {canManageAssets && (
          <button
            onClick={openCreateForm}
            className="btn btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Asset
          </button>
        )}
      </div>
      
      {(success || error) && (
        <div className={`mb-4 p-4 rounded-md ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message || error}
        </div>
      )}
      
      {/* Filters */}
      <div className="card mb-6">
        <h2 className="card-title">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="asset_type" className="label">Asset Type</label>
            <select
              id="asset_type"
              name="asset_type"
              value={filters.asset_type}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Types</option>
              {assetTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="status" className="label">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="location" className="label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Enter location"
              className="input"
            />
          </div>
        </div>
      </div>
      
      {/* Assets Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : assets.length > 0 ? (
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Condition</th>
                  <th className="table-header-cell">Purchase Date</th>
                  {canManageAssets && <th className="table-header-cell">Actions</th>}
                </tr>
              </thead>
              <tbody className="table-body">
                {assets.map(asset => (
                  <tr key={asset.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{asset.name}</td>
                    <td className="table-cell capitalize">{asset.asset_type}</td>
                    <td className="table-cell">{asset.location}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadgeClass(asset.status)} capitalize`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getConditionBadgeClass(asset.condition)} capitalize`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="table-cell">{formatDate(asset.purchase_date)}</td>
                    {canManageAssets && (
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditForm(asset)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No assets found. Please adjust your filters or add new assets.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
            disabled={filters.skip === 0}
            className={`btn btn-secondary ${filters.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Showing {filters.skip + 1} - {Math.min(filters.skip + filters.limit, filters.skip + assets.length)} assets
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
            disabled={assets.length < filters.limit}
            className={`btn btn-secondary ${assets.length < filters.limit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Asset Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="label">Asset Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="asset_type" className="label">Asset Type*</label>
                  <select
                    id="asset_type"
                    name="asset_type"
                    value={formData.asset_type}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select Type</option>
                    {assetTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group md:col-span-2">
                  <label htmlFor="description" className="label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="input"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="location" className="label">Location*</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="label">Status*</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="condition" className="label">Condition*</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    {conditionOptions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="purchase_date" className="label">Purchase Date*</label>
                  <input
                    type="date"
                    id="purchase_date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="warranty_until" className="label">Warranty Until</label>
                  <input
                    type="date"
                    id="warranty_until"
                    name="warranty_until"
                    value={formData.warranty_until}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAsset ? 'Update Asset' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
