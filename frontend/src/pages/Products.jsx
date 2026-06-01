import React, { useState, useEffect } from 'react';
import { productsApi } from '../services/api';
import { ErrorAlert, TableSkeleton, Button, Badge, EmptyState } from '../components/UI';
import { Plus, Trash2, Search, PackageSearch } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock_quantity: '' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10)
      };
      const { data } = await productsApi.create(payload);
      setProducts([...products, data]);
      setShowModal(false);
      setFormData({ name: '', sku: '', price: '', stock_quantity: '' });
      toast.success('Product created successfully');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create product.');
      toast.error('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockBadge = (quantity) => {
    if (quantity === 0) return <Badge variant="error">Out of Stock</Badge>;
    if (quantity <= 10) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors sm:text-sm shadow-sm"
          />
        </div>
        <Button onClick={() => setShowModal(true)} className="mt-4 sm:mt-0 w-full sm:w-auto">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <TableSkeleton />
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStockBadge(product.stock_quantity)}
                        <span className="text-xs text-gray-500">({product.stock_quantity})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState 
          title="No products found"
          description={searchQuery ? `No products match your search "${searchQuery}".` : "Get started by creating your first product in the inventory."}
          icon={PackageSearch}
          action={
            !searchQuery && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add First Product
              </Button>
            )
          }
        />
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Product</h3>
                  {formError && <ErrorAlert message={formError} />}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="e.g. Ergonomic Office Chair" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                      <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono" placeholder="e.g. CHAIR-001" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input required type="number" step="0.01" min="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                        <input required type="number" min="0" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 gap-2">
                  <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? 'Saving...' : 'Save Product'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="w-full sm:w-auto mt-3 sm:mt-0">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
