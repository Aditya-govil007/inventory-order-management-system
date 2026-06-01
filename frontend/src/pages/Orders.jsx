import React, { useState, useEffect } from 'react';
import { ordersApi, customersApi, productsApi } from '../services/api';
import { ErrorAlert, TableSkeleton, Button, Badge, EmptyState } from '../components/UI';
import { Plus, Trash2, ShoppingCart, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.getAll(),
        productsApi.getAll()
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data.filter(p => p.stock_quantity > 0));
    } catch (err) {
      setFormError('Failed to load customers or products.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setFormError(null);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this order?')) return;
    try {
      await ordersApi.delete(id);
      setOrders(orders.filter((o) => o.id !== id));
      toast.success('Order deleted successfully');
    } catch (err) {
      toast.error('Failed to delete order.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!selectedCustomerId) {
      setFormError('Please select a customer.');
      setSubmitting(false);
      return;
    }

    const validItems = orderItems
      .filter(item => item.product_id && item.quantity > 0)
      .map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10)
      }));

    if (validItems.length === 0) {
      setFormError('Please add at least one valid product.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        customer_id: parseInt(selectedCustomerId, 10),
        items: validItems
      };
      const { data } = await ordersApi.create(payload);
      setOrders([data, ...orders]); // add to top
      closeModal();
      toast.success('Order placed successfully');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create order. Check stock availability.');
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (product) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchQuery) || 
    o.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors sm:text-sm shadow-sm"
          />
        </div>
        <Button onClick={openModal} className="mt-4 sm:mt-0 w-full sm:w-auto">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Order
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <TableSkeleton />
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      #{order.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.full_name}</div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="brand">Completed</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(order.id)} className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
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
          title="No orders found"
          description={searchQuery ? `No orders match your search "${searchQuery}".` : "You haven't received any orders yet."}
          icon={ShoppingCart}
          action={
            !searchQuery && (
              <Button onClick={openModal}>
                <Plus className="w-4 h-4 mr-2" /> Create First Order
              </Button>
            )
          }
        />
      )}

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Order</h3>
                  {formError && <ErrorAlert message={formError} />}
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                      <select required value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg border shadow-sm">
                        <option value="">-- Choose Customer --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-900">Order Items</label>
                        <button type="button" onClick={handleAddItem} className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center">
                          <Plus className="w-4 h-4 mr-1" /> Add Product
                        </button>
                      </div>
                      <div className="p-4 space-y-3 bg-white">
                        {orderItems.map((item, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <select required value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} className="flex-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg border shadow-sm">
                              <option value="">-- Select Product --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)} (Stock: {p.stock_quantity})</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input required type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" className="w-24 block border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
                              <button type="button" onClick={() => handleRemoveItem(index)} disabled={orderItems.length === 1} className="text-gray-400 hover:text-red-500 transition-colors p-2 disabled:opacity-30">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end items-center">
                        <span className="text-sm font-medium text-gray-500 mr-3">Estimated Total:</span>
                        <span className="text-lg font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="bg-white px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 gap-2">
                  <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? 'Placing Order...' : 'Confirm Order'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={closeModal} className="w-full sm:w-auto mt-3 sm:mt-0">
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

export default Orders;
