import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { AttributeValueListResponse } from '@/types/attribute-value.type'

interface UseAttributeValuesParams {
  attributeId?: number
}

export const useAttributeValues = ({ attributeId }: UseAttributeValuesParams = {}) => {
  return useQuery({
    queryKey: ['attribute-values', attributeId],
    queryFn: async (): Promise<AttributeValueListResponse> => {
      const res = await api.get('/attribute-values', {
        params: attributeId ? { attributeId } : {},
      })
      return res.data
    },
  })
}
