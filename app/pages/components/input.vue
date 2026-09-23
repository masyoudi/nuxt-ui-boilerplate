<script setup lang="ts">
import { formDataBuilder } from '~/utils/helpers';
import { toArray } from '~~/shared/utils';
import { schema, MAX_LIMIT_FILE } from '~~/shared/schemas/profile';
import z from 'zod';
import type { MultiSelectItem } from '~/types/multi-select';
import { formatDate } from '@vueuse/core';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'input']
});

useHead({
  title: 'Input'
});

const _schema = schema.extend({
  file: z.custom<File | undefined>((data) => data instanceof File).superRefine((input, ctx) => {
    if ((input?.size ?? 0) > MAX_LIMIT_FILE) {
      ctx.addIssue({ code: 'custom', message: 'Max file size 2mb', input });
    }
  })
});

const formModel = reactive({
  name: '',
  email: '',
  gender: '',
  address: '',
  phone: '',
  dob: '',
  bio: '',
  file: undefined as File | undefined,
  hobbies: [] as MultiSelectItem<number>[]
});
const formState = computed(() => ({
  ...omit(formModel, 'hobbies'),
  hobbies: formModel.hobbies.map((item) => item.value)
}));
const formRef = useTemplateRef('formRef');
const loading = ref(false);
const toast = useToast();

const formHandler = defineFormHandler({
  schema: _schema,
  state: formState,
  async onSubmit(body) {
    try {
      loading.value = true;

      await useRequest('/profile', {
        method: 'POST',
        body: formDataBuilder(body)
      });

      toast.add({ description: 'Data successfully saved', color: 'success' });
    }
    catch (err) {
      displayError(err, formRef);
    }
    finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div class="p-5">
    <UCard>
      <div class="text-xl font-semibold mb-8">
        Input
      </div>

      <UForm
        ref="formRef"
        v-bind="formHandler"
        class="space-y-6"
      >
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="formModel.name"
            placeholder="Enter your name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="formModel.email"
            placeholder="Enter your email address"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Gender"
          name="gender"
        >
          <URadioGroup
            v-model="formModel.gender"
            name="gender"
            :items="[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' }
            ]"
          />
        </UFormField>

        <UFormField
          label="Date of Birth"
          name="dob"
        >
          <DatePicker
            v-model="formModel.dob"
            :creator="(v) => formatDate(v, 'YYYY-MM-DD')"
          />
        </UFormField>

        <UFormField
          label="Address"
          name="address"
        >
          <UTextarea
            v-model="formModel.address"
            placeholder="Enter address"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Phone Number"
          name="phone"
        >
          <InputMask
            v-model="formModel.phone"
            class="w-full"
            :mask="{ mask: '0'.repeat(15) }"
            placeholder="Enter phone number"
          />
        </UFormField>

        <UFormField
          label="Hobbies"
          name="hobbies"
        >
          <MultiSelect
            v-model="formModel.hobbies"
            url="/todos"
            multiple
            paginated
            color="neutral"
            placeholder="Search anything..."
            :transform-fetch-data="(res) => toArray(res.data).map((val) => ({
              value: val.id,
              label: val.task
            }))"
            :debounce="500"
          />
        </UFormField>

        <UFormField
          label="Bio"
          name="bio"
        >
          <TextEditor v-model="formModel.bio" />
        </UFormField>

        <UFormField
          label="Resume"
          name="file"
        >
          <UFileUpload
            v-slot="{ open }"
            v-model="formModel.file"
          >
            <UFieldGroup
              class="w-full"
              size="lg"
            >
              <UButton
                label="Choose file"
                @click="open()"
              />
              <UInput
                :model-value="formModel.file?.name"
                placeholder="Upload file here"
                readonly
                class="grow shrink"
                @click="open()"
              />
            </UFieldGroup>
          </UFileUpload>
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="submit"
            :loading="loading"
          >
            Submit
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
