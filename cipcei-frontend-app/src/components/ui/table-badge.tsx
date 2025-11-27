import { IP, IpRequestStatus, IpRequestType, IpStatus } from "@/types";
import { Badge } from "./badge";

// Check if IP is expired
export const isIpExpired = (expiresAt?: string): boolean => {
  return expiresAt ? new Date(expiresAt) < new Date() : false;
};

export const getStatusBadge = (status: IpRequestStatus) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
          Pendente
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          Aprovado
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          Rejeitado
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

export const getRequestTypeBadge = (requestType: IpRequestType) => {
  switch (requestType) {
    case "new":
      return (
        <Badge variant="secondary">
          Nova
        </Badge>
      );
    case "renewal":
      return (
        <Badge variant="secondary">
          Renovação
        </Badge>
      );
    case "cancellation":
      return (
        <Badge variant="secondary">
          Cancelamento
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          {requestType}
        </Badge>
      );
  }
};

// Get status badge variant
export const getIpStatusBadge = (status: IpStatus, expiresAt?: string) => {
  if (status === "expired" || isIpExpired(expiresAt)) {
    return (
      <Badge variant="destructive" className="bg-destructive/80 text-destructive-foreground">
        Expirado
      </Badge>
    );
  }
  if (status === "available") {
    return (
      <Badge variant="default" className="bg-secondary text-primary-foreground">
        Disponível
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-primary text-secondary-foreground">
      Alocado
    </Badge>
  );
};
