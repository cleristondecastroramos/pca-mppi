import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-xl font-bold">404</h1>
          <p className="mb-4 text-sm text-muted-foreground">Oops! Página não encontrada</p>
          <a href="/home" className="text-primary underline hover:opacity-80">
            Voltar para Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
