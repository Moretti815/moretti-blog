---
title: 相册详情
aside: false
comment: true
type: album_detail
---

<AlbumDetailPage :name="$params.name" />

<script setup>
import { useData } from "vitepress";
import AlbumDetailPage from "../../.vitepress/theme/views/AlbumDetail.vue";

const { page } = useData();
const $params = page.value.params;
</script>
