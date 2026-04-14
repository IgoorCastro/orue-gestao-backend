import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCrud<T>(key: string, service: any) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [key],
    queryFn: service.findAll
  });

  const create = useMutation({
    mutationFn: service.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] })
  });

  const update = useMutation({
    mutationFn: ({ id, data }: any) => service.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] })
  });

  const remove = useMutation({
    mutationFn: service.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] })
  });

  return { ...query, create, update, remove };
}