<template>
  <button type="button">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  width: 100%;
  height: 50px;
  font-size: 30px;
  font-weight: 700;
  background: linear-gradient(51.05deg, #ee2238 -57.1%, #bf1d67 156.72%);
  border: none;
  border-radius: 10px;
}
</style>
