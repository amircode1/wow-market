import { ItemDetailClient } from '@/components/items/ItemDetailClient';

interface ItemDetailPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { itemId } = await params;
  const id = parseInt(itemId);

  return <ItemDetailClient itemId={id} />;
}

