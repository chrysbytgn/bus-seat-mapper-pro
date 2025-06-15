
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NewExcursionDialog, NewExcursionData } from "@/components/NewExcursionDialog";

interface Excursion {
  id: string;
  name: string;
  date?: string;
  time?: string;
  place?: string;
}

const LOCAL_KEY = "excursions";

export default function ExcursionSelector() {
  const navigate = useNavigate();
  const [excursions, setExcursions] = useState<Excursion[]>(() => {
    const data = window.localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  });
-  const [newName, setNewName] = useState("");
-  const [showNew, setShowNew] = useState(false);
+  const [showNew, setShowNew] = useState(false);

  const goToExcursion = (id: string) => {
    navigate(`/excursion/${id}`);
  };

-  const handleNewExcursion = () => {
-    if (!newName.trim()) return;
-    const id = Date.now().toString();
-    const newExc = { id, name: newName.trim() };
-    const updated = [...excursions, newExc];
-    setExcursions(updated);
-    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
-    setNewName("");
-    setShowNew(false);
-    goToExcursion(id);
-  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="rounded-xl shadow-md py-10 px-4 w-full max-w-2xl bg-white">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center">Excursiones</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2 mb-8">
          {/* Botón grande para añadir nueva excursión */}
          <button
            className="flex flex-col items-center justify-center rounded-2xl border-4 border-dashed border-primary bg-muted hover:bg-accent transition-all py-10 px-2 cursor-pointer"
            onClick={() => setShowNew(true)}
            tabIndex={0}
            aria-label="Añadir nueva excursión"
          >
            <Plus size={48} className="text-primary mb-2" />
            <span className="text-xl font-semibold text-primary">Nueva excursión</span>
          </button>
          {/* Lista de excursiones existentes */}
          {excursions.map(exc => (
            <button
              key={exc.id}
              className="flex items-center justify-center rounded-2xl border-2 border-primary bg-primary text-white text-2xl lg:text-3xl font-bold shadow-md py-10 px-4 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary/40"
              onClick={() => goToExcursion(exc.id)}
            >
              {exc.name}
            </button>
          ))}
        </div>

-        {/* Modal sencillo para añadir nueva excursión */}
-        {showNew && (
-          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
-            <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 w-[95vw] max-w-sm border-2 border-primary">
-              <h2 className="text-xl font-bold mb-2 text-center">Nombre de la nueva excursión</h2>
-              <Input
-                placeholder="Ej: Excursión a la playa"
-                value={newName}
-                onChange={e => setNewName(e.target.value)}
-                onKeyDown={e => {
-                  if (e.key === "Enter") handleNewExcursion();
-                  if (e.key === "Escape") setShowNew(false);
-                }}
-                className="text-lg px-4 py-3"
-                autoFocus
-              />
-              <div className="flex gap-2 justify-center mt-2">
-                <button
-                  className="bg-primary text-white rounded-lg px-5 py-2 text-lg font-semibold hover:bg-primary/90 transition-all"
-                  onClick={handleNewExcursion}
-                  disabled={!newName.trim()}
-                >
-                  Guardar
-                </button>
-                <button
-                  className="bg-gray-200 text-gray-700 rounded-lg px-5 py-2 text-lg font-semibold hover:bg-gray-300 transition-all"
-                  onClick={() => setShowNew(false)}
-                >
-                  Cancelar
-                </button>
-              </div>
-            </div>
-          </div>
-        )}
+        {/* Dialog para nueva excursión */}
+        <NewExcursionDialog
+          open={showNew}
+          onCancel={() => setShowNew(false)}
+          onSave={(data: NewExcursionData) => {
+            const id = Date.now().toString();
+            const exc = {
+              id,
+              name: data.name,
+              date: data.date ? data.date.toISOString() : undefined,
+              time: data.time,
+              place: data.place,
+            };
+            const updated = [...excursions, exc];
+            setExcursions(updated);
+            window.localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
+            setShowNew(false);
+            goToExcursion(id);
+          }}
+        />
      </div>
    </div>
  );
}
