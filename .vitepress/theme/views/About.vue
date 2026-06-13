<template>
  <div id="about-page">
    <!-- 作者信息 -->
    <AuthorInfo :data="aboutData.authorInfo" :title="aboutData.title" />

    <!-- 文章更新热力图 -->
    <ContributionHeatmap />

    <!-- Hello Section -->
    <HelloSection />

    <!-- 内容信息 -->
    <ContentInfo :data="aboutData.contentInfo" />

    <!-- 技能和职业 -->
    <SkillsInfo :skills="aboutData.skills" :careers="aboutData.careers" />

    <!-- 座右铭和专长 -->
    <Motto :motto="aboutData.motto" :expertise="aboutData.expertise" />

    <!-- 性格和个人照片 -->
    <Personalities :data="aboutData.personalities" />

    <!-- 游戏 -->
    <Hobbies :games="aboutData.games" />

    <!-- 喜好 -->
    <Likes :likes="aboutData.likes" />

    <!-- 统计和个人信息 -->
    <OtherInfo :tj="aboutData.tj" :oneself="aboutData.oneself" />

    <!-- 建站原因 -->
    <Cause :data="aboutData.cause" />

    <!-- 十年计划 -->
    <TenYear :data="aboutData.tenyear" />

    <!-- 赞赏名单 -->
    <Award :award="aboutData.award" :reward-list="aboutData.rewardList" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ContributionHeatmap from '../components/About/ContributionHeatmap.vue';
import AuthorInfo from '../components/About/AuthorInfo.vue';
import HelloSection from '../components/About/HelloSection.vue';
import ContentInfo from '../components/About/ContentInfo.vue';
import SkillsInfo from '../components/About/SkillsInfo.vue';
import Motto from '../components/About/Motto.vue';
import Personalities from '../components/About/Personalities.vue';
import Hobbies from '../components/About/Hobbies.vue';
import Likes from '../components/About/Likes.vue';
import OtherInfo from '../components/About/OtherInfo.vue';
import Cause from '../components/About/Cause.vue';
import TenYear from '../components/About/TenYear.vue';
import Award from '../components/About/Award.vue';
import { aboutData } from '../assets/about.mjs';

onMounted(() => {
  document.body.classList.add('about-page-loaded');
});
</script>

<style lang="scss">
@use '../styles/about.scss';
</style>
