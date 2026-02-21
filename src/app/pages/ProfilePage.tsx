import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, User, Mail, Phone, Save } from "lucide-react";
import { toast } from "sonner";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateUserProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || "",
  });

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
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Inicia sesión para ver tu perfil
          </h2>
          <p className="text-gray-500 mb-6">
            Necesitas iniciar sesión para acceder a tu perfil y configuración
          </p>
          <Link to="/">
            <Button>Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      full_name: formData.full_name,
      phone: formData.phone,
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a la tienda
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-gray-100">
              <AvatarImage src={profile?.avatar_url || user?.photoURL || ""} />
              <AvatarFallback className="bg-gray-900 text-white text-2xl">
                {getInitials(profile?.full_name || user?.displayName || "U")}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">
              {profile?.full_name || user?.displayName || "Usuario"}
            </h3>
            <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tus datos personales y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-10"
                    disabled={!isEditing}
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  El correo electrónico no se puede modificar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    disabled={!isEditing}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {isEditing ? (
                  <>
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar cambios
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          full_name: profile?.full_name || "",
                          email: profile?.email || user?.email || "",
                          phone: profile?.phone || "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                  >
                    Editar perfil
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
