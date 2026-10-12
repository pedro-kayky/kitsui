async function salvarDadosDoAlbum(dados) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('albuns') // substitui pelo nome exato da tua tabela
    .upsert({
      user_id: user.id, // Garante que fica salvo na conta deste e-mail
      conteudo: dados,
      updated_at: new Date()
    }, { onConflict: 'user_id' });

  if (error) console.error("Erro ao guardar:", error.message);
}