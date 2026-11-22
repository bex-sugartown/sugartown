import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
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

// #50 Phase 1: submitting an empty required field shows an error and does not call onSubmit;
// a filled form calls onSubmit with its values and shows the success message.
export const SingleEmail = {
  args: {
    fields: singleEmailField,
    submitLabel: 'Subscribe',
    onSubmit: fn(async () => {}),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await expect(canvas.getByRole('alert')).toHaveTextContent('Email address is required')
    await expect(args.onSubmit).not.toHaveBeenCalled()

    await userEvent.type(canvas.getByLabelText(/Email address/), 'bex@sugartown.io')
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith({ email: 'bex@sugartown.io' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent('Message sent')
  },
}
