import Form from './Form'

export default {
  title: 'Patterns/Form',
  component: Form,
}

const contactFields = [
  { name: 'name',    label: 'Name',    type: 'text',  required: true,  autoComplete: 'name' },
  { name: 'email',   label: 'Email',   type: 'email', required: true,  autoComplete: 'email' },
  { name: 'message', label: 'Message', type: 'textarea', required: true },
]

const singleEmailField = [
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
]

export const ContactForm = {
  args: {
    fields: contactFields,
    submitLabel: 'Send message',
    onSubmit: async (values) => { alert(JSON.stringify(values, null, 2)) },
  },
}

export const SingleEmail = {
  args: {
    fields: singleEmailField,
    submitLabel: 'Subscribe',
    onSubmit: async (values) => { alert(JSON.stringify(values, null, 2)) },
  },
}
