<!-- 留言板页面 -->
<template>
  <div class="message-page">
    <div class="page-content">
      <div class="message-header">
        <h1 class="page-title">留言板</h1>
        <p class="page-desc">欢迎留言，我会尽快回复~</p>
      </div>
      <div class="message-content s-card">
        <EnvelopeMessageBoard />
      </div>
    </div>
  </div>
</template>

<script setup>
import EnvelopeMessageBoard from "../components/EnvelopeMessage.vue";
</script>

<style lang="scss" scoped>
.message-page {
  width: 100%;
  display: flex;
  flex-direction: row;
  animation: fade-up 0.6s 0.1s backwards;
  padding: 20px 0;

  .page-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .message-header {
    text-align: center;
    margin-bottom: 2rem;

    .page-title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: var(--main-font-color);
    }

    .page-desc {
      font-size: 1rem;
      color: var(--main-font-second-color);
    }
  }

  .message-content {
    background-color: var(--main-card-background);
    border-radius: 16px;
    border: 1px solid var(--main-card-border);
    box-shadow: 0 8px 16px -4px var(--main-border-shadow);
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .message-page {
    .message-content {
      padding: 1rem;
    }
  }
}
</style>
