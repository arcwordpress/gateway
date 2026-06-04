import { createStore } from '@arcwp/gateway-data';
import api from '../api';

const { store: dataStore, useStore: useDataStore } = createStore(async () => {
    const [docSetsResponse, docGroupsResponse, docsResponse] = await Promise.all([
        api.get('doc-sets', { params: { per_page: 100 } }),
        api.get('doc-groups', { params: { per_page: 100 } }),
        api.get('docs', { params: { per_page: 100 } }),
    ]);

    const docSets = docSetsResponse?.data?.data?.items || [];
    const docGroups = docGroupsResponse?.data?.data?.items || [];
    const docs = docsResponse?.data?.data?.items || [];

    return {
        docSets,
        docGroups,
        docs,
        getDocSetBySlug(slug) {
            return docSets.find(ds => ds.slug === slug);
        },
        getDocSetById(id) {
            return docSets.find(ds => ds.id === id);
        },
        getDocGroupsByDocSetId(docSetId) {
            return docGroups
                .filter(dg => dg.doc_set_id === docSetId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));
        },
        getDocGroupBySlug(slug) {
            return docGroups.find(dg => dg.slug === slug);
        },
        getDocGroupBySlugAndDocSetId(slug, docSetId) {
            return docGroups.find(dg => dg.slug === slug && dg.doc_set_id === docSetId);
        },
        getDocGroupById(id) {
            return docGroups.find(dg => dg.id === id);
        },
        getDocsByDocGroupId(docGroupId) {
            return docs
                .filter(d => d.doc_group_id === docGroupId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));
        },
        getDocBySlug(slug) {
            return docs.find(d => d.slug === slug);
        },
        getDocBySlugAndDocGroupId(slug, docGroupId) {
            return docs.find(d => d.slug === slug && d.doc_group_id === docGroupId);
        },
        getDocById(id) {
            return docs.find(d => d.id === id);
        },
    };
});

export { useDataStore };
export default dataStore;
