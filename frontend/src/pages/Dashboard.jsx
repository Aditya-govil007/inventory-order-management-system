import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { ErrorAlert, TableSkeleton, EmptyState } from '../components/UI';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardApi.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={2} />;
  if (error) return <ErrorAlert message={error} />;
  if (!stats) return null;

  const cards = [
    { name: 'Total Products', value: stats.total_products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 via-transparent to-transparent', trend: '+12%', trendUp: true, link: '/products' },
    { name: 'Total Customers', value: stats.total_customers, icon: Users, color: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500/10 via-transparent to-transparent', trend: '+5%', trendUp: true, link: '/customers' },
    { name: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500/10 via-transparent to-transparent', trend: '+18%', trendUp: true, link: '/orders' },
    { name: 'Low Stock Alerts', value: stats.low_stock_products.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500/10 via-transparent to-transparent', trend: '-2%', trendUp: false, link: '/products' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.name} to={card.link} className="block group">
            <div className={`bg-white relative overflow-hidden shadow-sm hover:shadow-lg rounded-xl border border-gray-100 transition-all duration-300 transform group-hover:-translate-y-1`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-xl p-4 ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className={`h-7 w-7 ${card.color}`} aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-500 truncate mb-1">{card.name}</dt>
                      <dd className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</dd>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.trendUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                    {card.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {card.trend}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {stats.total_products === 0 ? (
        <EmptyState 
          title="Welcome to your Dashboard"
          description="It looks like you haven't added any data yet. Get started by heading over to the Products page to create your first inventory item."
          icon={Package}
          action={
            <Link to="/products" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm">
              <Package className="w-4 h-4 mr-2" /> Add First Product
            </Link>
          }
        />
      ) : stats.low_stock_products.length > 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-red-100 overflow-hidden">
          <div className="px-6 py-5 bg-red-50/50 border-b border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Action Required: Low Stock</h3>
            </div>
            <Link to="/products" className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
              Manage Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.low_stock_products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {product.stock_quantity} remaining
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inventory is healthy</h3>
          <p className="text-gray-500">No products are currently running low on stock.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
