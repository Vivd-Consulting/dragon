import useLocationSearch from 'hooks/useLocationSearch';

export default function useTreeLocationSearch({
  key,
  initialValue
}: {
  key: string;
  initialValue?: string;
}) {
  const [search, setSearch] = useLocationSearch({ key, initialValue });

  let filters = {};
  const searchSplit = search?.split(',');

  if (searchSplit?.length === 2) {
    filters = {
      [searchSplit[0]]: searchSplit[1]
    };
  }

  return [filters, setSearch, search];
}
