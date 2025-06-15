
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Excursion {
  id: string;
  name: string;
}

const LOCAL_KEY = "excursions";

export default function ExcursionSelector() {
  const navigate = useNavigate();
  const [excursions, setExcursions] = useState<Excursion[]>(() => {
    const data = window.localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  });
  const [newName, setNewName] = useState("");

  const goToExcursion = (id: string) => {
    navigate(`/excursion/${id}`);
  };

  const handleNewExcursion = () => {
    if (!newName.trim()) return;
    const id = Date.now().toString();
    const newExc = { id, name: newName.trim() };
    const updated = [...excursions, newExc];
    setExcursions(updated);
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    setNewName("");
    goToExcursion(id);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Selecciona o crea una excursión</h1>
        <div className="mb-4">
          <Input
            placeholder="Nombre de la nueva excursión"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleNewExcursion(); }}
          />
          <Button className="w-full mt-2" onClick={handleNewExcursion} disabled={!newName.trim()}>
            Crear excursión
          </Button>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Excursiones existentes</h2>
          {excursions.length === 0 ? (
            <p className="text-gray-400 text-sm">Aún no hay excursiones creadas.</p>
          ) : (
            <ul>
              {excursions.map(exc => (
                <li key={exc.id}>
                  <Button variant="outline" className="w-full mb-2 text-left" onClick={() => goToExcursion(exc.id)}>
                    {exc.name}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
