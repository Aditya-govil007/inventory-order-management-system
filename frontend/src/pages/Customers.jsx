import React, { useState, useEffect } from 'react';
import { customersApi } from '../services/api';
import { ErrorAlert, TableSkeleton, Button, EmptyState, ConfirmModal } from '../components/UI';
import { Plus, Trash2, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const executeDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal({ isOpen: false, id: null, name: '' });
    try {
      await customersApi.delete(id);
      setCustomers(customers.filter((c) => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (err) {
      toast.error('Failed to delete customer. Ensure they have no associated orders.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const { data } = await customersApi.create(formData);
      setCustomers([...customers, data]);
      setShowModal(false);
      setFormData({ full_name: '', email: '', phone: '' });
      toast.success('Customer created successfully');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create customer.');
      toast.error('Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors sm:text-sm shadow-sm"
          />
        </div>
        <Button onClick={() => setShowModal(true)} className="mt-4 sm:mt-0 w-full sm:w-auto">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Customer
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <TableSkeleton />
      ) : filteredCustomers.length > 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs mr-3">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => confirmDelete(customer.id, customer.full_name)} className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
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
          title="No Customers Found"
          description={searchQuery ? `No customers match your search "${searchQuery}".` : "Your customer database is empty. Add your first customer."}
          icon={Users}
          action={
            !searchQuery && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add First Customer
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Customer</h3>
                  {formError && <ErrorAlert message={formError} />}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="e.g. Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 gap-2">
                  <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? 'Saving...' : 'Save Customer'}
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={executeDelete}
        title="Delete Customer"
        message="Are you sure you want to permanently delete this customer? This action cannot be undone and will fail if they have active orders."
        itemName={deleteModal.name}
      />
    </div>
  );
};

export default Customers;
