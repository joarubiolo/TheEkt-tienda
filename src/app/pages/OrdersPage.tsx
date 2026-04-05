import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../services/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, ShoppingBag, Package, Calendar, DollarSign } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_name: string;
  customer_lastname: string;
  delivery_type: string;
  payment_method: string;
}

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await getOrders(user.uid);
    
    if (error) {
      console.error("Error loading orders:", error);
    } else if (data) {
      setOrders(data);
    }
    
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "outline" | "destructive" } } = {
      pendiente: { label: "Pendiente", variant: "outline" },
      pagado: { label: "Pagado", variant: "default" },
      procesando: { label: "Procesando", variant: "secondary" },
      enviado: { label: "Enviado", variant: "secondary" },
      entregado: { label: "Entregado", variant: "default" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Inicia sesión para ver tus pedidos
          </h2>
          <p className="text-gray-500 mb-6">
            Necesitas iniciar sesión para ver tu historial de compras
          </p>
          <Link to="/">
            <Button>Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a la tienda
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes pedidos aún
          </h2>
          <p className="text-gray-500 mb-6">
            Cuando realices una compra, aparecerá aquí
          </p>
          <Link to="/">
            <Button>Ir a comprar</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pedido {order.order_number}</CardTitle>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.customer_name} {order.customer_lastname}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.payment_status)}
                      <span className="text-xs text-gray-500 uppercase">{order.payment_method}</span>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">
                      {order.delivery_type === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-lg">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
