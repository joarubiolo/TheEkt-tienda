import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const productName = searchParams.get("product");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: productName ? `Consulta sobre: ${productName}\n\n` : "",
  });

  useEffect(() => {
    if (productName) {
      setFormData((prev) => ({
        ...prev,
        message: `Consulta sobre: ${productName}\n\n`,
      }));
    }
  }, [productName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    toast.success("Mensaje enviado con éxito. Te contactaremos pronto.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="size-4 mr-2" />
        Volver a la tienda
      </Link>

      <h1 className="text-3xl text-gray-900 mb-8">Contáctanos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl text-gray-900 mb-6">Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                Nombre completo <span className="text-red-600">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">
                Mensaje <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu consulta aquí..."
                rows={6}
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              Enviar mensaje
            </Button>
          </form>
        </div>

        {/* Información de contacto */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl text-gray-900 mb-6">Información de contacto</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <MapPin className="size-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-900 mb-1">Dirección</h3>
                  <p className="text-sm text-gray-600">
                    Calle Principal 123, Local 4<br />
                    Ciudad de Buenos Aires, Argentina<br />
                    CP: 1001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Mail className="size-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-900 mb-1">Email</h3>
                  <a
                    href="mailto:contacto@tiendaropa.com"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    contacto@tiendaropa.com
                  </a>
                  <br />
                  <a
                    href="mailto:ventas@tiendaropa.com"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ventas@tiendaropa.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Phone className="size-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-900 mb-1">Teléfono</h3>
                  <a
                    href="tel:+541143218765"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    +54 11 4321-8765
                  </a>
                  <br />
                  <a
                    href="tel:+5491155667788"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    +54 9 11 5566-7788 (WhatsApp)
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg text-gray-900 mb-4">Horarios de atención</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lunes a Viernes:</span>
                <span className="text-gray-900">9:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sábados:</span>
                <span className="text-gray-900">10:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domingos:</span>
                <span className="text-gray-900">Cerrado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
